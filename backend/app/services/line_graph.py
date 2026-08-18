"""
Builds a graph of the skeletonized palm and picks out the four principal
lines (Life, Head, Heart, Fate) by position and orientation. Ported from the
notebook (Cells 5 & 6).
"""
from math import atan2, degrees

import cv2
import numpy as np
import networkx as nx

DIRECTIONS = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def _neighbours(skel, y, x, height, width):
    pts = []
    for dy, dx in DIRECTIONS:
        ny, nx_ = y + dy, x + dx
        if 0 <= ny < height and 0 <= nx_ < width and skel[ny, nx_]:
            pts.append((ny, nx_))
    return pts


def build_graph(skeleton: np.ndarray):
    skel = (skeleton > 0).astype(np.uint8)
    height, width = skel.shape

    ys, xs = np.nonzero(skel)
    endpoints, junctions = [], []
    for y, x in zip(ys, xs):
        n = len(_neighbours(skel, y, x, height, width))
        if n == 1:
            endpoints.append((int(y), int(x)))
        elif n >= 3:
            junctions.append((int(y), int(x)))

    important_nodes = set(endpoints + junctions)
    graph = nx.Graph()
    visited = set()

    def trace_edge(start, next_pixel):
        edge = [start]
        previous, current = start, next_pixel
        while True:
            edge.append(current)
            if current in important_nodes:
                break
            nbrs = [p for p in _neighbours(skel, current[0], current[1], height, width) if p != previous]
            if not nbrs:
                break
            previous, current = current, nbrs[0]
        return edge

    for node in important_nodes:
        for nxt in _neighbours(skel, node[0], node[1], height, width):
            key = tuple(sorted([node, nxt]))
            if key in visited:
                continue
            edge = trace_edge(node, nxt)
            if len(edge) < 2:
                continue
            start, end = edge[0], edge[-1]
            visited.add(key)
            graph.add_node(start)
            graph.add_node(end)
            graph.add_edge(start, end, pixels=edge, length=len(edge))

    return graph, endpoints, junctions


def render_graph_image(skeleton, graph):
    img = cv2.cvtColor(skeleton, cv2.COLOR_GRAY2RGB)
    for _, _, data in graph.edges(data=True):
        pts = data["pixels"]
        for p1, p2 in zip(pts[:-1], pts[1:]):
            cv2.line(img, (p1[1], p1[0]), (p2[1], p2[0]), (255, 255, 0), 1)
    for node in graph.nodes():
        cv2.circle(img, (node[1], node[0]), 3, (255, 60, 60), -1)
    return img


def _edge_angle(edge):
    pts = edge["pixels"]
    p1, p2 = pts[0], pts[-1]
    dy, dx = p2[0] - p1[0], p2[1] - p1[1]
    return abs(degrees(atan2(dy, dx)))


def _edge_center(edge):
    pts = np.array(edge["pixels"])
    return pts.mean(axis=0)


def detect_lines(graph, skeleton_shape):
    edges = []
    for u, v, data in graph.edges(data=True):
        edges.append({
            "u": u, "v": v,
            "pixels": data["pixels"],
            "length": data["length"],
            "angle": _edge_angle(data),
            "center": _edge_center(data),
        })
    edges = [e for e in edges if e["length"] > 18]

    H, W = skeleton_shape

    life_candidates = [e for e in edges if e["center"][1] < W * 0.55]
    life_line = max(life_candidates, key=lambda e: e["length"]) if life_candidates else None

    heart_candidates = [e for e in edges if e["center"][0] < H * 0.45 and e["angle"] < 35]
    heart_line = max(heart_candidates, key=lambda e: e["length"]) if heart_candidates else None

    head_candidates = [e for e in edges if H * 0.35 < e["center"][0] < H * 0.70 and e["angle"] < 45]
    head_line = max(head_candidates, key=lambda e: e["length"]) if head_candidates else None

    fate_candidates = [e for e in edges if W * 0.30 < e["center"][1] < W * 0.70 and e["angle"] > 60]
    fate_line = max(fate_candidates, key=lambda e: e["length"]) if fate_candidates else None

    return {"Life": life_line, "Head": head_line, "Heart": heart_line, "Fate": fate_line}


LINE_COLORS = {
    "Life": (46, 204, 113),
    "Head": (231, 76, 60),
    "Heart": (52, 152, 219),
    "Fate": (241, 196, 15),
}


def render_lines_image(skeleton, lines: dict):
    img = cv2.cvtColor(skeleton, cv2.COLOR_GRAY2RGB)
    for name, edge in lines.items():
        if edge is None:
            continue
        color = LINE_COLORS[name]
        pts = edge["pixels"]
        for p1, p2 in zip(pts[:-1], pts[1:]):
            cv2.line(img, (p1[1], p1[0]), (p2[1], p2[0]), color, 3)
    return img
