import { IoMedicalOutline, IoTimeOutline, IoCallOutline, IoHelpCircleOutline } from "react-icons/io5";
import { useLanguage } from "../../context/context";

type SuggestionProps = {
  onSelect: (text: string) => void;
};

const suggestions = {
  en: [
    { text: "What are the visiting hours?", icon: <IoTimeOutline /> },
    { text: "Show me list of doctors", icon: <IoMedicalOutline /> },
    { text: "Emergency contact numbers", icon: <IoCallOutline /> },
    { text: "How to book an appointment?", icon: <IoHelpCircleOutline /> },
  ],
  hi: [
    { text: "मिलने का समय क्या है?", icon: <IoTimeOutline /> },
    { text: "डॉक्टरों की सूची दिखाएं", icon: <IoMedicalOutline /> },
    { text: "आपातकालीन संपर्क नंबर", icon: <IoCallOutline /> },
    { text: "अपॉइंटमेंट कैसे बुक करें?", icon: <IoHelpCircleOutline /> },
  ]
};

const SuggestionChips = ({ onSelect }: SuggestionProps) => {
  // @ts-ignore
  const { lang } = useLanguage();
  const currentSuggestions = suggestions[lang as keyof typeof suggestions] || suggestions.en;

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px", justifyContent: "center", maxWidth: "800px" }}>
      {currentSuggestions.map((s, index) => (
        <button
          key={index}
          onClick={() => onSelect(s.text)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "99px",
            color: "var(--text-color)",
            fontSize: "0.95rem",
            boxShadow: "var(--shadow-sm)",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "var(--secondary-color)";
            e.currentTarget.style.borderColor = "var(--primary-color)";
            e.currentTarget.style.color = "var(--primary-color)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "var(--card-bg)";
            e.currentTarget.style.borderColor = "var(--border-color)";
            e.currentTarget.style.color = "var(--text-color)";
          }}
        >
          <span style={{ color: "var(--primary-color)", fontSize: "1.1rem" }}>{s.icon}</span>
          {s.text}
        </button>
      ))}
    </div>
  );
};

export default SuggestionChips;
