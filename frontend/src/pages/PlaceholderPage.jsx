function PlaceholderPage({
  title,
  description,
}) {
  return (
    <section className="dashboard-page">

      <p className="eyebrow">
        ARCHITECTURE MODULE
      </p>

      <h1>
        {title}
      </h1>

      <article className="result-card">

        <p>
          {description}
        </p>

        <p className="section-note">
          This module is being
          integrated from the existing
          working platform.
        </p>

      </article>

    </section>
  );
}


export default PlaceholderPage;