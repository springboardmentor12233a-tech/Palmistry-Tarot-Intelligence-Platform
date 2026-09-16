from ultralytics import YOLO

model = YOLO("backend/best.pt")

model.export(
    format="onnx",
    imgsz=640,
    simplify=True
)
