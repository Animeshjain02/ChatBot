import { Link } from "react-router-dom";
import styles from "./Logo.module.css";
import { IoPulseOutline } from "react-icons/io5";

const Logo = () => {
	return (
		<div className={styles.parent}>
			<Link to={"/"} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
				<IoPulseOutline size={32} color="var(--primary-color)" />
				<span className={styles.title}>EDUMATE</span>
			</Link>
		</div>
	);
};

export default Logo;
