import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl, getApiError, imageUrl } from "../utils/api";

export default function TryOn() {
  const [person, setPerson] = useState(null);
  const [personPreview, setPersonPreview] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedCloth, setSelectedCloth] = useState(null);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1=upload, 2=select, 3=result
  const [garmentDes, setGarmentDes] = useState("");
  const autoCrop = true;
  const denoiseSteps = 30;
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const loadingMessages = [
    "🧠 AI is analyzing your photo...",
    "👗 Fitting the garment on your silhouette...",
    "✨ Generating realistic try-on...",
    "🎨 Rendering final image...",
    "🌟 Almost ready, polishing details...",
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let i = 0;
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMsg(loadingMessages[i % loadingMessages.length]);
        i++;
      }, 3000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(apiUrl("/products"));
      setProducts(res.data);
    } catch {
      setError("Could not load products. Make sure the backend is running.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPerson(file);
    setPersonPreview(URL.createObjectURL(file));
    setOutput(null);
    setError(null);
    if (step === 1) setStep(2);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setPerson(file);
      setPersonPreview(URL.createObjectURL(file));
      setOutput(null);
      setError(null);
      if (step === 1) setStep(2);
    }
  };

  const handleTryOn = async () => {
    if (!person || !selectedCloth) {
      setError("Please upload your photo and select a product first.");
      return;
    }

    setLoading(true);
    setError(null);
    setOutput(null);
    setLoadingMsg(loadingMessages[0]);

    const formData = new FormData();
    formData.append("person", person);
    formData.append("cloth_path", selectedCloth.image);
    formData.append("garment_des", garmentDes || selectedCloth.name || "full body elegant bridal dress");
    formData.append("auto_crop", autoCrop ? "true" : "false");
    formData.append("denoise_steps", denoiseSteps.toString());

    try {
      const res = await axios.post(apiUrl("/tryon"), formData, {
        timeout: 300000, // 5 min timeout
      });

      if (res.data.success) {
        const resultUrl = res.data.output_url || imageUrl(res.data.output_local);
        setOutput(resultUrl);
        setStep(3);
      } else {
        setError(res.data.error || "Try-on failed. Please try again.");
      }
    } catch (err) {
      const msg = getApiError(err, "Try-on failed.");
      
      if (msg.includes("YOUR_REPLICATE_API_TOKEN_HERE") || msg.includes("API key not configured")) {
        setError("⚠️ API key not configured or invalid. Please check backend/app.py");
      } else if (err.code === "ECONNABORTED") {
        setError("⏱️ The request timed out. AI generation can take up to 2 minutes. Please try again.");
      } else {
        setError(`Try-On Error: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setPerson(null);
    setPersonPreview(null);
    setSelectedCloth(null);
    setOutput(null);
    setError(null);
    setStep(1);
  };

  return (
    <div style={styles.page}>
      {/* ── BACKGROUND ── */}
      <div style={styles.bgGradient} />
      <div style={styles.bgOrbs}>
        <div style={{ ...styles.orb, ...styles.orb1 }} />
        <div style={{ ...styles.orb, ...styles.orb2 }} />
        <div style={{ ...styles.orb, ...styles.orb3 }} />
      </div>

      {/* ── HEADER ── */}
      <div style={styles.header}>
        <button onClick={() => navigate("/user")} style={styles.backBtn}>
          ← Back
        </button>
        <div style={styles.headerCenter}>
          <div style={styles.headerIcon}>✨</div>
          <div>
            <h1 style={styles.headerTitle}>AI Virtual Try-On</h1>
            <p style={styles.headerSubtitle}>
              See how the outfit looks on you — powered by AI
            </p>
          </div>
        </div>
        {step > 1 && (
          <button onClick={resetAll} style={styles.resetBtn}>
            🔄 Start Over
          </button>
        )}
      </div>

      {/* ── STEP INDICATOR ── */}
      <div style={styles.stepRow}>
        {["Upload Photo", "Select Outfit", "View Result"].map((label, i) => (
          <React.Fragment key={i}>
            <div style={styles.stepItem}>
              <div
                style={{
                  ...styles.stepCircle,
                  ...(step > i + 1
                    ? styles.stepDone
                    : step === i + 1
                    ? styles.stepActive
                    : styles.stepPending),
                }}
              >
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span
                style={{
                  ...styles.stepLabel,
                  opacity: step >= i + 1 ? 1 : 0.4,
                }}
              >
                {label}
              </span>
            </div>
            {i < 2 && <div style={styles.stepLine} />}
          </React.Fragment>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={styles.mainGrid}>
        {/* LEFT: Upload + Product */}
        <div style={styles.leftPanel}>
          {/* Rules Box */}
          <div style={{ ...styles.card, border: "1px solid rgba(233, 30, 140, 0.4)", background: "rgba(233, 30, 140, 0.05)" }}>
            <h2 style={styles.cardTitle}>
              <span style={styles.cardIcon}>📌</span> Important Rules
            </h2>
            <ul style={styles.rulesList}>
              <li style={styles.ruleItem}>Upload a clear, front-facing photo showing your body.</li>
              <li style={styles.ruleItem}>Ensure your body pose is clearly visible and not obscured.</li>
              <li style={styles.ruleItem}>Avoid overly loose clothing in the original photo.</li>
              <li style={styles.ruleItem}>The AI will reject photos if it cannot detect a human body.</li>
            </ul>
          </div>

          {/* Upload Box */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span style={styles.cardIcon}>📸</span> Your Photo
            </h2>

            {personPreview ? (
              <div style={styles.previewContainer}>
                <img
                  src={personPreview}
                  alt="Uploaded person"
                  style={styles.previewImage}
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  style={styles.changePhotoBtn}
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <div
                style={styles.dropZone}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current.click()}
              >
                <div style={styles.dropIcon}>📷</div>
                <p style={styles.dropText}>Drop your photo here</p>
                <p style={styles.dropSub}>or click to browse</p>
                <p style={styles.dropHint}>
                  Tip: Use a full-body photo for best results
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Selected Product Preview */}
          {selectedCloth && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                <span style={styles.cardIcon}>👗</span> Selected Outfit
              </h2>
              <div style={styles.selectedClothBox}>
                <img
                  src={imageUrl(selectedCloth.image)}
                  alt={selectedCloth.name}
                  style={styles.selectedClothImg}
                />
                <div style={styles.selectedClothInfo}>
                  <p style={styles.selectedClothName}>{selectedCloth.name}</p>
                  <p style={styles.selectedClothPrice}>₹ {selectedCloth.price}</p>
                  <span style={styles.selectedClothBadge}>
                    {selectedCloth.category}
                  </span>
                </div>
              </div>
            </div>
          )}




          {/* TRY ON BUTTON */}
          <button
            onClick={handleTryOn}
            disabled={loading || !person || !selectedCloth}
            className={!person || !selectedCloth ? "" : "btn-hover"}
            style={{
              ...styles.tryOnBtn,
              opacity: !person || !selectedCloth ? 0.5 : 1,
              cursor: !person || !selectedCloth ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span style={styles.btnLoading}>
                <span style={styles.spinner} />
                Generating...
              </span>
            ) : (
              "✨ Generate Try-On"
            )}
          </button>
        </div>

        {/* RIGHT: Products & Result */}
        <div style={styles.rightPanel}>
          {/* PRODUCT SELECTION */}
          {!output && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                <span style={styles.cardIcon}>🛍️</span> Select an Outfit
              </h2>
              {products.length === 0 ? (
                <div style={styles.emptyProducts}>
                  <p>No products found. Upload products from the admin panel.</p>
                </div>
              ) : (
                <div style={styles.productGrid}>
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="product-card-hover"
                      onClick={() => {
                        setSelectedCloth(p);
                        setGarmentDes(p.name);
                        if (step < 2) setStep(2);
                      }}
                      style={{
                        ...styles.productCard,
                        ...(selectedCloth?.id === p.id
                          ? styles.productCardSelected
                          : {}),
                      }}
                    >
                      <div style={styles.productImgWrap}>
                        <img
                          src={imageUrl(p.image)}
                          alt={p.name}
                          style={styles.productImg}
                        />
                        {selectedCloth?.id === p.id && (
                          <div style={styles.productCheckmark}>✓</div>
                        )}
                      </div>
                      <div style={styles.productInfo}>
                        <p style={styles.productName}>{p.name}</p>
                        <p style={styles.productPrice}>₹ {p.price}</p>
                        <span style={styles.productCategory}>{p.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div style={styles.loadingCard}>
              <div style={styles.loadingAnimation}>
                <div style={styles.loadingRing} />
                <div style={{ ...styles.loadingRing, ...styles.loadingRing2 }} />
                <div style={styles.loadingCenter}>✨</div>
              </div>
              <h3 style={styles.loadingTitle}>AI is Working its Magic</h3>
              <p style={styles.loadingMsg}>{loadingMsg}</p>
              <p style={styles.loadingTime}>
                This typically takes 30–90 seconds
              </p>
              <div style={styles.loadingBar}>
                <div style={styles.loadingBarFill} />
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div style={styles.errorCard}>
              <div style={styles.errorIcon}>⚠️</div>
              <p style={styles.errorText}>{error}</p>
              {error.includes("API key") && (
                <div style={styles.apiKeyInstructions}>
                  <p style={styles.apiKeyTitle}>How to get a free API key:</p>
                  <ol style={styles.apiKeyList}>
                    <li>Go to <strong>fashn.ai</strong> and sign up (free)</li>
                    <li>Go to Developer Dashboard → API Keys</li>
                    <li>Copy your token</li>
                    <li>
                      Paste it in <code style={styles.code}>backend/app.py</code>{" "}
                      at <code style={styles.code}>FASHN_API_KEY</code>
                    </li>
                    <li>Restart the backend server</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* RESULT */}
          {output && (
            <div style={styles.resultCard}>
              <h2 style={styles.resultTitle}>🎉 Your Virtual Try-On Result</h2>
              <div style={styles.comparisonRow}>
                <div style={styles.comparisonItem}>
                  <p style={styles.comparisonLabel}>Original Photo</p>
                  <img
                    src={personPreview}
                    alt="Original"
                    style={styles.comparisonImg}
                  />
                </div>
                <div style={styles.comparisonArrow}>→</div>
                <div style={styles.comparisonItem}>
                  <p style={styles.comparisonLabel}>After Try-On ✨</p>
                  <img
                    src={output}
                    alt="Try-On Result"
                    style={styles.comparisonImg}
                  />
                </div>
              </div>

              <div style={styles.resultActions}>
                <a
                  href={output}
                  download="tryon-result.png"
                  style={styles.downloadBtn}
                >
                  ⬇️ Download Result
                </a>
                <button onClick={resetAll} style={styles.tryAnotherBtn}>
                  🔄 Try Another Outfit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0a14",
    color: "#f0e6ff",
    fontFamily: "'Segoe UI', sans-serif",
    position: "relative",
    overflowX: "hidden",
    paddingBottom: 60,
  },
  bgGradient: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(ellipse at 20% 20%, #1a0533 0%, #0a0a14 50%, #0d0520 100%)",
    zIndex: 0,
    pointerEvents: "none",
  },
  bgOrbs: {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
  },
  orb: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    opacity: 0.15,
  },
  orb1: {
    width: 500,
    height: 500,
    background: "#9b59f4",
    top: "-100px",
    left: "-100px",
  },
  orb2: {
    width: 400,
    height: 400,
    background: "#e91e8c",
    top: "40%",
    right: "-150px",
  },
  orb3: {
    width: 300,
    height: 300,
    background: "#3b82f6",
    bottom: "-80px",
    left: "30%",
  },

  // Header
  header: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 40px",
    borderBottom: "1px solid rgba(155, 89, 244, 0.2)",
    background: "rgba(15, 5, 30, 0.8)",
    backdropFilter: "blur(10px)",
  },
  backBtn: {
    background: "rgba(155, 89, 244, 0.15)",
    border: "1px solid rgba(155, 89, 244, 0.4)",
    color: "#d4b3ff",
    padding: "8px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.2s",
  },
  headerCenter: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  headerIcon: {
    fontSize: 36,
    background: "linear-gradient(135deg, #9b59f4, #e91e8c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  headerTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    background: "linear-gradient(90deg, #d4b3ff, #f472b6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  headerSubtitle: {
    margin: 0,
    fontSize: 13,
    color: "#9b8ab0",
  },
  resetBtn: {
    background: "rgba(233, 30, 140, 0.15)",
    border: "1px solid rgba(233, 30, 140, 0.4)",
    color: "#f472b6",
    padding: "8px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },

  // Steps
  stepRow: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    padding: "28px 40px",
  },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  stepCircle: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 15,
    transition: "all 0.3s",
  },
  stepActive: {
    background: "linear-gradient(135deg, #9b59f4, #e91e8c)",
    color: "#fff",
    boxShadow: "0 0 20px rgba(155, 89, 244, 0.6)",
  },
  stepDone: {
    background: "linear-gradient(135deg, #10b981, #34d399)",
    color: "#fff",
  },
  stepPending: {
    background: "rgba(255,255,255,0.1)",
    border: "2px solid rgba(255,255,255,0.2)",
    color: "#6b6b8a",
  },
  stepLabel: {
    fontSize: 12,
    color: "#a89bc0",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  stepLine: {
    width: 80,
    height: 2,
    background:
      "linear-gradient(90deg, rgba(155,89,244,0.3), rgba(233,30,140,0.3))",
    margin: "0 8px",
    marginBottom: 26,
  },

  // Layout
  mainGrid: {
    position: "relative",
    zIndex: 10,
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: 24,
    padding: "0 40px",
    maxWidth: 1400,
    margin: "0 auto",
  },
  leftPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  rightPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  // Card
  card: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(155, 89, 244, 0.2)",
    borderRadius: 20,
    padding: 24,
    backdropFilter: "blur(10px)",
  },
  cardTitle: {
    margin: "0 0 18px 0",
    fontSize: 17,
    fontWeight: 700,
    color: "#d4b3ff",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardIcon: {
    fontSize: 20,
  },
  rulesList: {
    margin: 0,
    paddingLeft: 20,
    color: "#d4b3ff",
    fontSize: 13,
    lineHeight: "1.6",
  },
  ruleItem: {
    marginBottom: 6,
  },

  // Drop zone
  dropZone: {
    border: "2px dashed rgba(155, 89, 244, 0.4)",
    borderRadius: 16,
    padding: "40px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "rgba(155, 89, 244, 0.05)",
  },
  dropIcon: { fontSize: 48, marginBottom: 12 },
  dropText: {
    margin: "0 0 4px",
    fontSize: 16,
    fontWeight: 600,
    color: "#d4b3ff",
  },
  dropSub: { margin: "0 0 12px", fontSize: 13, color: "#8a79a0" },
  dropHint: {
    margin: 0,
    fontSize: 11,
    color: "#6b5f80",
    fontStyle: "italic",
  },

  // Preview
  previewContainer: { position: "relative", textAlign: "center" },
  previewImage: {
    width: "100%",
    maxHeight: 320,
    objectFit: "contain",
    borderRadius: 14,
    border: "2px solid rgba(155, 89, 244, 0.4)",
  },
  changePhotoBtn: {
    marginTop: 12,
    background: "rgba(155, 89, 244, 0.2)",
    border: "1px solid rgba(155, 89, 244, 0.4)",
    color: "#d4b3ff",
    padding: "8px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },

  // Selected cloth
  selectedClothBox: {
    display: "flex",
    gap: 14,
    alignItems: "center",
  },
  selectedClothImg: {
    width: 80,
    height: 100,
    objectFit: "cover",
    borderRadius: 10,
    border: "2px solid rgba(155,89,244,0.5)",
  },
  selectedClothInfo: { flex: 1 },
  selectedClothName: {
    margin: "0 0 4px",
    fontWeight: 700,
    fontSize: 15,
    color: "#e2d4ff",
  },
  selectedClothPrice: {
    margin: "0 0 8px",
    fontSize: 14,
    color: "#f472b6",
    fontWeight: 600,
  },
  selectedClothBadge: {
    background: "rgba(155,89,244,0.2)",
    border: "1px solid rgba(155,89,244,0.4)",
    color: "#c084fc",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Try-On button
  tryOnBtn: {
    background: "linear-gradient(135deg, #9b59f4 0%, #e91e8c 100%)",
    border: "none",
    color: "#fff",
    padding: "16px",
    borderRadius: 14,
    fontSize: 17,
    fontWeight: 800,
    cursor: "pointer",
    width: "100%",
    transition: "all 0.2s",
    boxShadow: "0 4px 24px rgba(155, 89, 244, 0.4)",
    letterSpacing: 0.5,
  },
  btnLoading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  spinner: {
    width: 18,
    height: 18,
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    display: "inline-block",
  },

  // Product grid
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
    maxHeight: 500,
    overflowY: "auto",
    paddingRight: 4,
  },
  productCard: {
    background: "rgba(255,255,255,0.04)",
    border: "2px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    cursor: "pointer",
    transition: "all 0.2s",
    overflow: "hidden",
  },
  productCardSelected: {
    border: "2px solid #9b59f4",
    background: "rgba(155, 89, 244, 0.12)",
    boxShadow: "0 0 16px rgba(155,89,244,0.3)",
  },
  productImgWrap: {
    position: "relative",
    height: 140,
    overflow: "hidden",
  },
  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  productCheckmark: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "#9b59f4",
    color: "#fff",
    borderRadius: "50%",
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    boxShadow: "0 2px 8px rgba(155,89,244,0.5)",
  },
  productInfo: {
    padding: "10px 10px 12px",
  },
  productName: {
    margin: "0 0 2px",
    fontSize: 13,
    fontWeight: 700,
    color: "#e2d4ff",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  productPrice: {
    margin: "0 0 6px",
    fontSize: 12,
    color: "#f472b6",
    fontWeight: 600,
  },
  productCategory: {
    background: "rgba(155,89,244,0.15)",
    color: "#b48cff",
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyProducts: {
    textAlign: "center",
    padding: "30px 0",
    color: "#6b5f80",
    fontSize: 14,
  },

  // Loading card
  loadingCard: {
    background: "rgba(155, 89, 244, 0.08)",
    border: "1px solid rgba(155, 89, 244, 0.3)",
    borderRadius: 20,
    padding: 40,
    textAlign: "center",
    backdropFilter: "blur(10px)",
  },
  loadingAnimation: {
    position: "relative",
    width: 100,
    height: 100,
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingRing: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "3px solid transparent",
    borderTop: "3px solid #9b59f4",
    animation: "spin 1.2s linear infinite",
  },
  loadingRing2: {
    inset: 12,
    borderTop: "3px solid #e91e8c",
    animationDuration: "0.8s",
    animationDirection: "reverse",
  },
  loadingCenter: {
    fontSize: 28,
    position: "relative",
    zIndex: 1,
  },
  loadingTitle: {
    margin: "0 0 12px",
    fontSize: 20,
    fontWeight: 800,
    color: "#d4b3ff",
  },
  loadingMsg: {
    margin: "0 0 8px",
    fontSize: 15,
    color: "#c084fc",
    minHeight: 22,
    transition: "all 0.3s",
  },
  loadingTime: {
    margin: "0 0 20px",
    fontSize: 12,
    color: "#7a6a90",
  },
  loadingBar: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 6,
    height: 6,
    overflow: "hidden",
  },
  loadingBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #9b59f4, #e91e8c)",
    borderRadius: 6,
    animation: "loadbar 2.5s ease-in-out infinite",
    width: "60%",
  },

  // Error card
  errorCard: {
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: 16,
    padding: 24,
    textAlign: "center",
  },
  errorIcon: { fontSize: 32, marginBottom: 10 },
  errorText: {
    margin: "0 0 16px",
    color: "#fca5a5",
    fontSize: 14,
    lineHeight: 1.6,
  },
  apiKeyInstructions: {
    background: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    padding: 16,
    textAlign: "left",
  },
  apiKeyTitle: {
    margin: "0 0 10px",
    fontWeight: 700,
    fontSize: 14,
    color: "#fbbf24",
  },
  apiKeyList: {
    margin: 0,
    padding: "0 0 0 18px",
    fontSize: 13,
    color: "#e2d4ff",
    lineHeight: 2,
  },
  code: {
    background: "rgba(155,89,244,0.2)",
    padding: "1px 6px",
    borderRadius: 4,
    fontSize: 12,
    fontFamily: "monospace",
    color: "#c084fc",
  },

  // Result card
  resultCard: {
    background: "rgba(16, 185, 129, 0.06)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: 20,
    padding: 28,
    backdropFilter: "blur(10px)",
  },
  resultTitle: {
    margin: "0 0 24px",
    fontSize: 22,
    fontWeight: 800,
    color: "#6ee7b7",
    textAlign: "center",
  },
  comparisonRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    justifyContent: "center",
    marginBottom: 24,
  },
  comparisonItem: { textAlign: "center", flex: 1 },
  comparisonLabel: {
    margin: "0 0 10px",
    fontSize: 13,
    fontWeight: 600,
    color: "#a89bc0",
  },
  comparisonImg: {
    width: "100%",
    maxHeight: 400,
    objectFit: "contain",
    borderRadius: 14,
    border: "2px solid rgba(255,255,255,0.1)",
  },
  comparisonArrow: {
    fontSize: 32,
    color: "#9b59f4",
    flexShrink: 0,
  },
  resultActions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
  },
  downloadBtn: {
    background: "linear-gradient(135deg, #10b981, #34d399)",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
    display: "inline-block",
  },
  tryAnotherBtn: {
    background: "rgba(155, 89, 244, 0.2)",
    border: "1px solid rgba(155, 89, 244, 0.4)",
    color: "#d4b3ff",
    padding: "12px 24px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },
};

// CSS keyframes injection
const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes loadbar {
    0% { width: 10%; margin-left: 0; }
    50% { width: 60%; margin-left: 30%; }
    100% { width: 10%; margin-left: 90%; }
  }
  .product-card-hover {
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease !important;
  }
  .product-card-hover:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 15px 30px rgba(155, 89, 244, 0.3) !important;
  }
  .btn-hover {
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease !important;
  }
  .btn-hover:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 8px 30px rgba(233, 30, 140, 0.5) !important;
  }
`;
document.head.appendChild(styleTag);
