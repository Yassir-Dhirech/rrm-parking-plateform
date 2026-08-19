import { Button } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./PublicNavbar.module.css";

export function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate(path);
  };

  return (
    <nav className={styles.navbar}>
      <img
        src="/pictures/logo-rrm.png"
        alt="Rabat Région Mobilité"
        className={styles.logo}
        onClick={() => handleNavClick("/")}
        style={{ cursor: "pointer" }}
      />

      <ul className={styles.links}>
        <li>
          <a
            href="/"
            className={location.pathname === "/" ? styles.active : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("/");
            }}
          >
            Accueil
          </a>
        </li>
        <li>
          <a
            href="/demande-publique"
            className={location.pathname === "/demande-publique" ? styles.active : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("/demande-publique");
            }}
          >
            S'abonner & Démarches
          </a>
        </li>
        <li>
          <a
            href="/about"
            className={location.pathname === "/about" ? styles.active : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("/about");
            }}
          >
            À propos
          </a>
        </li>
        <li>
          <a
            href="/contact"
            className={location.pathname === "/contact" ? styles.active : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("/contact");
            }}
          >
            Contact
          </a>
        </li>
      </ul>

      <Button
        type="primary"
        onClick={() => handleNavClick("/login")}
        style={{ borderRadius: 20, backgroundColor: "#003566", borderColor: "#003566" }}
      >
        Connexion personnel RRM
      </Button>
    </nav>
  );
}