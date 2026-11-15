"""
Pure-PyTorch drop-in for the legacy NATTEN functional API used by allin1 (no compiled CUDA extension, so it
runs on Windows / any torch version). Semantics follow NATTEN <=0.17:

  * dilated neighbourhood: position i attends to K positions in its own dilation group (j ≡ i mod d)
  * at the borders the window shifts inward so every position still has K neighbours
  * relative positional bias rpb[h, (j - i)/d + K - 1]

natten1dqkrpb(q, k, rpb, K, d)  q,k: (B, h, L, D)        -> (B, h, L, K)
natten1dav(a, v, K, d)          a: (B, h, L, K)           -> (B, h, L, D)
natten2dqkrpb(q, k, rpb, K, d)  q,k: (B, h, H, W, D)      -> (B, h, H, W, K*K)
natten2dav(a, v, K, d)          a: (B, h, H, W, K*K)      -> (B, h, H, W, D)
"""
import torch

_cache = {}


def _axis(L, K, d, device):
    """(idx, rel, valid) for one axis: idx[i, k] neighbour index, rel[i, k] rpb index, valid mask."""
    key = (L, K, d, device)
    if key in _cache:
        return _cache[key]
    i = torch.arange(L, device=device)
    r, p = i % d, i // d
    Ld = (L - r + d - 1) // d                      # length of i's dilation group
    nb = K // 2
    start = torch.minimum(torch.clamp(p - nb, min=0), torch.clamp(Ld - K, min=0))
    q = start[:, None] + torch.arange(K, device=device)[None, :]       # position within the group
    idx = r[:, None] + q * d
    valid = q < Ld[:, None]
    rel = (q - p[:, None]) + K - 1
    out = (idx.clamp(max=L - 1), rel.clamp(0, 2 * K - 2), valid)
    _cache[key] = out
    return out


def natten1dqkrpb(query, key, rpb, kernel_size, dilation):
    B, h, L, D = query.shape
    idx, rel, valid = _axis(L, kernel_size, dilation, query.device)
    kg = key[:, :, idx]                                       # (B, h, L, K, D)
    attn = torch.einsum("bhld,bhlkd->bhlk", query, kg)
    if rpb is not None:
        attn = attn + rpb[:, rel].unsqueeze(0).to(attn.dtype)  # (1, h, L, K)
    return attn.masked_fill(~valid, float("-inf"))


def natten1dav(attn, value, kernel_size, dilation):
    B, h, L, D = value.shape
    idx, _, valid = _axis(L, kernel_size, dilation, value.device)
    vg = value[:, :, idx]                                     # (B, h, L, K, D)
    a = attn.masked_fill(~valid, 0.0)
    return torch.einsum("bhlk,bhlkd->bhld", a, vg)


def natten2dqkrpb(query, key, rpb, kernel_size, dilation):
    B, h, H, W, D = query.shape
    K = kernel_size
    ih, rh, vh = _axis(H, K, dilation, query.device)
    iw, rw, vw = _axis(W, K, dilation, query.device)
    kg = key[:, :, ih[:, None, :, None], iw[None, :, None, :]]   # (B, h, H, W, K, K, D)
    attn = torch.einsum("bhxyd,bhxyijd->bhxyij", query, kg)
    if rpb is not None:
        bias = rpb[:, rh[:, None, :, None], rw[None, :, None, :]]  # (h, H, W, K, K)
        attn = attn + bias.unsqueeze(0).to(attn.dtype)
    valid = vh[:, None, :, None] & vw[None, :, None, :]
    attn = attn.masked_fill(~valid, float("-inf"))
    return attn.reshape(B, h, H, W, K * K)


def natten2dav(attn, value, kernel_size, dilation):
    B, h, H, W, D = value.shape
    K = kernel_size
    ih, _, vh = _axis(H, K, dilation, value.device)
    iw, _, vw = _axis(W, K, dilation, value.device)
    vg = value[:, :, ih[:, None, :, None], iw[None, :, None, :]]  # (B, h, H, W, K, K, D)
    valid = vh[:, None, :, None] & vw[None, :, None, :]
    a = attn.reshape(B, h, H, W, K, K).masked_fill(~valid, 0.0)
    return torch.einsum("bhxyij,bhxyijd->bhxyd", a, vg)
