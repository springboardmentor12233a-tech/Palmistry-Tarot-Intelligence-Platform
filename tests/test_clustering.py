from palmtarot.clustering.model import FEATURE_COLUMNS, PalmClusterPipeline


def test_palm_cluster_pipeline_fit_predict():
    pipeline = PalmClusterPipeline(n_clusters=5, random_state=42)
    pipeline.fit()

    assert pipeline.is_fitted

    sample_features = {
        "palm_width": 0.25,
        "palm_height": 0.40,
        "thumb_length": 0.42,
        "index_length": 0.45,
        "middle_length": 0.50,
        "ring_length": 0.46,
        "little_length": 0.38,
        "aspect_ratio": 1.60
    }

    cluster_id, (pca_x, pca_y) = pipeline.transform_and_predict(sample_features)
    assert 0 <= cluster_id < 5
    assert isinstance(pca_x, float)
    assert isinstance(pca_y, float)


def test_palm_cluster_summary():
    pipeline = PalmClusterPipeline(n_clusters=5, random_state=42)
    summary = pipeline.get_cluster_summary()
    assert summary.shape[0] == 5
    assert list(summary.columns) == FEATURE_COLUMNS
