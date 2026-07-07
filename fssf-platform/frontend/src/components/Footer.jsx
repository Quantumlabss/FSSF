export default function Footer() {
  return (
    <footer className="fssf-footer py-4 mt-5">
      <div className="container d-flex flex-wrap justify-content-between gap-2">
        <span>FSSF // FIRST SPECIAL SERVICE FORCE // PAVLOV VR MILSIM UNIT</span>
        <span>EST. 2024 — GRID REF UNKNOWN — {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
