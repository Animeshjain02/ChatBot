import { NavLink } from "react-router-dom";
import styles from "./Home.module.css";
import { motion } from "framer-motion";
import { IoShieldCheckmarkOutline, IoPulseOutline, IoChatbubbleEllipsesOutline } from "react-icons/io5";

const Home = () => {
	return (
		<div className={styles.parent}>
			<div className={styles.container}>
				<motion.h1
					className={styles.title}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					EDUMATE AI
				</motion.h1>

				<motion.p
					className={styles.subtitle}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					Experience instant, reliable, and confidential medical assistance.
					Powered by advanced AI to provide accurate answers to your health queries 24/7.
				</motion.p>

				<motion.div
					className={styles.ctaContainer}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					<NavLink to='/login' className={styles.primaryBtn}>
						Get Started
					</NavLink>
					{/* Optional Secondary Button */}
					{/* <NavLink to='/about' className={styles.secondaryBtn}>
                        Learn More
                    </NavLink> */}
				</motion.div>

				<motion.div
					className={styles.featuresGrid}
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.4 }}
				>
					<div className={styles.featureCard}>
						<IoChatbubbleEllipsesOutline className={styles.featureIcon} />
						<h3 className={styles.featureTitle}>Instant Answers</h3>
						<p className={styles.featureDesc}>Get immediate responses to your health questions without waiting for an appointment.</p>
					</div>
					<div className={styles.featureCard}>
						<IoShieldCheckmarkOutline className={styles.featureIcon} />
						<h3 className={styles.featureTitle}>Private & Secure</h3>
						<p className={styles.featureDesc}>Your conversations are encrypted and private. We prioritize your data security.</p>
					</div>
					<div className={styles.featureCard}>
						<IoPulseOutline className={styles.featureIcon} />
						<h3 className={styles.featureTitle}>Reliable Info</h3>
						<p className={styles.featureDesc}>Trained on vast medical datasets to ensure you receive accurate and helpful guidance.</p>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default Home;
