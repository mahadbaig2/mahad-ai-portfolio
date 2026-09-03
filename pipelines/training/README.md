# pipelines/training

Custom query-router model training and export pipeline.

## Stack
- Baseline: TF-IDF + Logistic Regression
- Candidate: Compact transformer (MiniLM / DistilBERT)
- Experiment tracking: MLflow
- Packaging: Export to ONNX for in-process FastAPI execution
