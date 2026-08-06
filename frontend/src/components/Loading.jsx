function Loading({ text = "Loading..." }) {
  return (
    <div className="loading-container">

      <div className="loader"></div>

      <h3>{text}</h3>

    </div>
  );
}

export default Loading;