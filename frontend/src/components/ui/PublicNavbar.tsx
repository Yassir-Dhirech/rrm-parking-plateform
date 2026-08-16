import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./PublicNavbar.module.css";

export function PublicNavbar() {
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      <img src="/pictures/logo-rrm.png" alt="RRM" className={styles.logo} onClick={() => navigate("/")} style={{ cursor: "pointer" }} />

      <ul className={styles.links}>
        <li><a href="#accueil">Accueil</a></li>
        <li><a href="#abonnement">S'abonner</a></li>
        <li><a href="#about">À propos</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      <Button type="primary" onClick={() => navigate("/login")}>
        Connexion personnel RRM
      </Button>
    </nav>
  );
}