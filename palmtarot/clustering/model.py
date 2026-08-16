import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

FEATURE_COLUMNS = [
    "palm_width",
    "palm_height",
    "thumb_length",
    "index_length",
    "middle_length",
    "ring_length",
    "little_length",
    "aspect_ratio"
]


class PalmClusterPipeline:
    """PCA + KMeans clustering pipeline for palm feature vectors."""

    def __init__(self, n_clusters: int = 5, random_state: int = 42):
        self.n_clusters = n_clusters
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=2, random_state=random_state)
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
        self.is_fitted = False

    def _generate_synthetic_training_data(self, n_samples: int = 100) -> pd.DataFrame:
        """Generate realistic synthetic hand features to fit model if no dataset is provided."""
        np.random.seed(self.random_state)
        data = {
            "palm_width": np.random.uniform(0.20, 0.35, n_samples),
            "palm_height": np.random.uniform(0.35, 0.55, n_samples),
            "thumb_length": np.random.uniform(0.35, 0.55, n_samples),
            "index_length": np.random.uniform(0.40, 0.60, n_samples),
            "middle_length": np.random.uniform(0.45, 0.65, n_samples),
            "ring_length": np.random.uniform(0.40, 0.60, n_samples),
            "little_length": np.random.uniform(0.30, 0.50, n_samples),
        }
        df = pd.DataFrame(data)
        df["aspect_ratio"] = df["palm_height"] / df["palm_width"]
        return df

    def fit(self, df: pd.DataFrame = None) -> "PalmClusterPipeline":
        """Fit scaler, PCA, and KMeans models."""
        if df is None or df.empty or not set(FEATURE_COLUMNS).issubset(df.columns):
            df = self._generate_synthetic_training_data()

        X = df[FEATURE_COLUMNS].astype("float32")
        X_scaled = self.scaler.fit_transform(X)
        self.pca.fit(X_scaled)
        self.kmeans.fit(X_scaled)
        self.is_fitted = True
        return self

    def transform_and_predict(self, feature_dict: dict[str, float]) -> tuple[int, tuple[float, float]]:
        """Predict cluster and return 2D PCA coordinates for a single feature vector."""
        if not self.is_fitted:
            self.fit()

        vec = np.array([[feature_dict.get(col, 0.0) for col in FEATURE_COLUMNS]], dtype="float32")
        vec_scaled = self.scaler.transform(vec)
        pca_coords = self.pca.transform(vec_scaled)[0]
        cluster_id = int(self.kmeans.predict(vec_scaled)[0])

        return cluster_id, (float(pca_coords[0]), float(pca_coords[1]))

    def get_cluster_summary(self, df: pd.DataFrame = None) -> pd.DataFrame:
        """Calculate cluster mean summary statistics."""
        if df is None or df.empty or not set(FEATURE_COLUMNS).issubset(df.columns):
            df = self._generate_synthetic_training_data(200)

        if not self.is_fitted:
            self.fit(df)

        X = df[FEATURE_COLUMNS].astype("float32")
        X_scaled = self.scaler.transform(X)
        clusters = self.kmeans.predict(X_scaled)

        df_copy = df.copy()
        df_copy["Cluster"] = clusters
        summary = df_copy.groupby("Cluster")[FEATURE_COLUMNS].mean()
        return summary
