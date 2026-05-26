import { useMemo, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowRight,
  FaBolt,
  FaCheck,
  FaCloudUploadAlt,
  FaCopy,
  FaDownload,
  FaFileAlt,
  FaLock,
  FaQrcode,
  FaRegClock,
  FaUpload,
} from "react-icons/fa";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`;
};

function App() {
  const [activeTab, setActiveTab] = useState("send");
  const [file, setFile] = useState(null);
  const [shareCode, setShareCode] = useState("");
  const [downloadCode, setDownloadCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const downloadUrl = useMemo(
    () => `${API_BASE_URL}/api/files/download/${downloadCode.trim()}`,
    [downloadCode]
  );

  const uploadFile = async () => {
    if (!file) {
      setMessage("Choose a file before sending.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/files/upload`,
        formData
      );

      setShareCode(response.data.code);
      setMessage("Your file is ready to share.");
    } catch (error) {
      console.error(error);
      setMessage("Upload failed. Check that the backend and Redis are running.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFile = () => {
    if (!downloadCode.trim()) {
      setMessage("Enter a six-digit share code.");
      return;
    }

    window.location.href = downloadUrl;
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="app-shell">
      <div className="grid-glow" />

      <nav className="nav">
        <a href="#top" className="brand" aria-label="DropIt home">
          <span className="brand-mark">
            <FaCloudUploadAlt />
          </span>
          DropIt
        </a>

        <div className="nav-links" aria-label="Primary navigation">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
        </div>

        <a className="nav-cta" href="#share">
          Start sharing
        </a>
      </nav>

      <section id="top" className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-copy"
        >
          <span className="eyebrow">Fast temporary file transfer</span>
          <h1>
            Share files with a code that{" "}
            <span>expires automatically.</span>
          </h1>
          <p>
            Upload a file, send the six-digit code, and let the receiver
            download it from anywhere while your Spring Boot backend keeps the
            transfer temporary.
          </p>
        </motion.div>

        <motion.section
          id="share"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="transfer-panel"
          aria-label="File transfer panel"
        >
          <div className="tab-bar">
            <button
              type="button"
              className={activeTab === "send" ? "active" : ""}
              onClick={() => setActiveTab("send")}
            >
              <FaUpload />
              Send
            </button>
            <button
              type="button"
              className={activeTab === "receive" ? "active" : ""}
              onClick={() => setActiveTab("receive")}
            >
              <FaDownload />
              Receive
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "send" ? (
              <motion.div
                key="send"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="panel-body"
              >
                <label className="drop-zone">
                  <input
                    type="file"
                    onChange={(event) => {
                      setFile(event.target.files?.[0] || null);
                      setShareCode("");
                      setMessage("");
                    }}
                  />
                  <span className="drop-icon">
                    <FaFileAlt />
                  </span>
                  <strong>
                    {file ? file.name : "Drop a file here or browse"}
                  </strong>
                  <small>
                    {file
                      ? `${formatBytes(file.size)} selected`
                      : "Files are stored temporarily and linked to one code."}
                  </small>
                </label>

                <button
                  type="button"
                  className="primary-action"
                  onClick={uploadFile}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Create share code"}
                  <FaArrowRight />
                </button>

                {shareCode && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="code-result"
                  >
                    <div>
                      <span>Share code</span>
                      <strong>{shareCode}</strong>
                    </div>
                    <button type="button" onClick={copyCode} aria-label="Copy code">
                      {copied ? <FaCheck /> : <FaCopy />}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="receive"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="panel-body"
              >
                <div className="receive-box">
                  <span className="drop-icon">
                    <FaQrcode />
                  </span>
                  <strong>Enter the sender's code</strong>
                  <small>The download starts directly from the backend.</small>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    value={downloadCode}
                    maxLength={6}
                    onChange={(event) =>
                      setDownloadCode(event.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>

                <button
                  type="button"
                  className="primary-action"
                  onClick={downloadFile}
                >
                  Download file
                  <FaArrowRight />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {message && <p className="status-message">{message}</p>}
        </motion.section>
      </section>

      <section id="features" className="section-block">
        <div className="section-heading">
          <span>Everything needed</span>
          <h2>
            Temporary sharing that feels <strong>instant and simple.</strong>
          </h2>
        </div>

        <div className="feature-grid">
          {[
            {
              icon: <FaBolt />,
              title: "Quick codes",
              copy: "Each upload returns a short six-digit code that is easy to send in chat.",
            },
            {
              icon: <FaLock />,
              title: "Private by default",
              copy: "Downloads require the generated code, and files expire from Redis and storage.",
            },
            {
              icon: <FaRegClock />,
              title: "Auto cleanup",
              copy: "The backend removes old uploads on a schedule so storage stays tidy.",
            },
          ].map((feature) => (
            <article className="feature-card" key={feature.title}>
              <span>{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="steps-section">
        <div className="section-heading">
          <span>How DropIt works</span>
          <h2>
            From selected file to <strong>downloaded anywhere.</strong>
          </h2>
        </div>

        <div className="steps">
          {["Upload your file", "Share the code", "Receiver downloads"].map(
            (step, index) => (
              <div className="step" key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            )
          )}
        </div>
      </section>

      <section id="faq" className="faq-section">
        <div className="section-heading">
          <span>FAQ</span>
          <h2>Built for simple deploys.</h2>
        </div>

        <div className="faq-list">
          <details>
            <summary>Will this work on Vercel and Render?</summary>
            <p>
              Yes. Set the frontend's Vercel environment variable
              VITE_API_BASE_URL to your Render backend URL.
            </p>
          </details>
          <details>
            <summary>How long are files available?</summary>
            <p>
              The current backend stores metadata for 10 minutes and cleans old
              files from disk on the same cadence.
            </p>
          </details>
          <details>
            <summary>Does the backend need Redis?</summary>
            <p>
              Yes. Redis stores the temporary code-to-file mapping used for
              downloads.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
}

export default App;
