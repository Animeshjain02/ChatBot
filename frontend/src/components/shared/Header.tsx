import Logo from "./Logo";
import styles from "./Header.module.css";
import { useAuth } from "../../context/context";
import ProfileMenu from "./ProfileMenu";

const Header = () => {
	const auth = useAuth();

	return (
		<div className={styles.parent}>
			<div>
				<Logo />
			</div>

			<div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
				{auth?.isLoggedIn ? (
					<ProfileMenu />
				) : (
					<>
						{/* Buttons removed as per user request */}
					</>
				)}
			</div>
		</div>
	);
};

export default Header;
