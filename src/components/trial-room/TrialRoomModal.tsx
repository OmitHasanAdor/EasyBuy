"use client";

import { useState, useEffect, useRef, useId, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
  AlertCircle,
  Download,
  RotateCcw,
  ShoppingCart,
  Info,
  Bookmark,
  BookmarkCheck,
  Check,
  Trash2,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/lib/cart-context";
import BeforeAfterSlider from "./BeforeAfterSlider";
import type { GarmentCategory } from "@/lib/tryon";

type TrialRoomProduct = {
  id: number;
  name: string;
  images: string[];
  price: number;
  category?: string;
};

type TrialRoomModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: TrialRoomProduct;
  selectedImage?: string;
};

const LOADING_MESSAGES = [
  "Detecting human pose and body contours...",
  "Generating clothing-agnostic mask...",
  "Warping garment to match your posture...",
  "Synthesizing realistic fabric folds and ambient lighting...",
  "Polishing final render...",
];

function inferCategory(product: TrialRoomProduct): GarmentCategory {
  const text = `${product.name} ${product.category || ""}`.toLowerCase();
  if (text.match(/pant|trouser|jean|skirt|short|bottom/)) return "Lower-body";
  if (text.match(/dress|saree|gown|kurti|salwar/)) return "Dress";
  return "Upper-body";
}

export type UserGalleryPhoto = {
  id: string;
  url: string;
  label: string;
};

function getInitialUserPhotos(sessionUser?: { email?: string | null; image?: string | null }): UserGalleryPhoto[] {
  const email = sessionUser?.email?.toLowerCase() || "";
  const photos: UserGalleryPhoto[] = [];

  if (email.includes("sophia")) {
    photos.push(
      {
        id: "sophia-01",
        url: "/trial-room/avatars/female/female-avatar-01-tank-jeans.png",
        label: "Full-Body Front",
      },
      {
        id: "sophia-02",
        url: "/trial-room/avatars/female/female-avatar-09-white-slip-dress.png",
        label: "Slip Dress Pose",
      }
    );
  } else if (email.includes("marcus")) {
    photos.push(
      {
        id: "marcus-01",
        url: "/trial-room/avatars/male/male-avatar-01-athletic-tank-jeans.png",
        label: "Athletic Front",
      },
      {
        id: "marcus-02",
        url: "/trial-room/avatars/male/male-avatar-02-asian-athletic-tank-jeans.png",
        label: "Denim Pose",
      }
    );
  } else if (email.includes("elena")) {
    photos.push({
      id: "elena-01",
      url: "/trial-room/avatars/female/female-avatar-08-bobhair-tank-jeans.png",
      label: "Studio Front",
    });
  } else if (sessionUser?.image) {
    photos.push({
      id: "profile-photo",
      url: sessionUser.image,
      label: "My Photo",
    });
  }

  if (photos.length === 0) {
    photos.push({
      id: "default-pose",
      url: "/trial-room/avatars/female/female-avatar-01-tank-jeans.png",
      label: "Full-Body Front",
    });
  }

  return photos;
}

export default function TrialRoomModal({
  isOpen,
  onClose,
  product,
  selectedImage,
}: TrialRoomModalProps) {
  const { data: session } = authClient.useSession();
  const { addItem } = useCart();
  const fileInputId = useId();

  // Garment image defaults to selected variant or first catalog image
  const garmentImage = selectedImage || product.images?.[0] || "";

  const [category, setCategory] = useState<GarmentCategory>(() => inferCategory(product));
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<UserGalleryPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingLook, setSavingLook] = useState(false);
  const [savedLook, setSavedLook] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load personal photo gallery from localStorage or defaults
  useEffect(() => {
    if (!isOpen) return;
    const storageKey = `easybuy_gallery_${session?.user?.id || session?.user?.email || "guest"}`;
    let photos: UserGalleryPhoto[] = [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        photos = JSON.parse(saved);
      }
    } catch {
      photos = [];
    }

    if (!photos || photos.length === 0) {
      photos = getInitialUserPhotos(session?.user);
      try {
        localStorage.setItem(storageKey, JSON.stringify(photos));
      } catch {
        // ignore
      }
    }

    setGallery(photos);
    if (photos.length > 0 && !personImage) {
      setPersonImage(photos[0].url);
    }
  }, [isOpen, session?.user, personImage]);

  // Reset/sync category when product changes
  const [prevProductId, setPrevProductId] = useState(product.id);
  if (prevProductId !== product.id) {
    setPrevProductId(product.id);
    setCategory(inferCategory(product));
    setError(null);
  }

  // Cycle loading messages while generating
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  // Handle local image file upload, add to personal gallery & select
  const handleFileUpload = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPG, PNG, WebP).");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be smaller than 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        if (!dataUrl) return;

        const newPhoto: UserGalleryPhoto = {
          id: `custom-${Date.now()}`,
          url: dataUrl,
          label: `Photo ${gallery.length + 1}`,
        };

        const updated = [newPhoto, ...gallery];
        setGallery(updated);
        setPersonImage(dataUrl);
        setResultImage(null);
        setError(null);

        const storageKey = `easybuy_gallery_${session?.user?.id || session?.user?.email || "guest"}`;
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {
          // ignore
        }

        toast.success("Photo added to your personal try-on gallery!");
      };
      reader.onerror = () => {
        toast.error("Failed to read image file.");
      };
      reader.readAsDataURL(file);
    },
    [gallery, session?.user]
  );

  const [isGalleryManagerOpen, setIsGalleryManagerOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<UserGalleryPhoto | null>(null);

  // Confirm delete of a photo from personal gallery
  const confirmDeletePhoto = () => {
    if (!photoToDelete) return;
    if (gallery.length <= 1) {
      toast.error("You need at least one photo in your gallery.");
      setPhotoToDelete(null);
      return;
    }
    const updated = gallery.filter((p) => p.id !== photoToDelete.id);
    setGallery(updated);
    const storageKey = `easybuy_gallery_${session?.user?.id || session?.user?.email || "guest"}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (personImage === photoToDelete.url) {
      setPersonImage(updated[0]?.url || null);
      setResultImage(null);
    }
    toast.success(`Removed "${photoToDelete.label}" from your gallery.`);
    setPhotoToDelete(null);
  };

  const handleRestoreDefaults = () => {
    const defaults = getInitialUserPhotos(session?.user);
    setGallery(defaults);
    if (!personImage || !defaults.some((p) => p.url === personImage)) {
      setPersonImage(defaults[0]?.url || null);
    }
    const storageKey = `easybuy_gallery_${session?.user?.id || session?.user?.email || "guest"}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(defaults));
    } catch {
      // ignore
    }
    toast.success("Restored default try-on photos!");
  };

  // Submit try-on request to server API
  const handleGenerateTryOn = async () => {
    if (!personImage) {
      toast.error("Please upload your photo first.");
      return;
    }

    if (!garmentImage) {
      toast.error("No product image found for try-on.");
      return;
    }

    setLoadingStep(0);
    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const res = await fetch("/api/trial-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personImage,
          garmentImage,
          category,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Generation failed. Please try again.");
      }

      setResultImage(data.resultImageUrl);
      toast.success("Virtual Try-On complete!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      console.error("Try-On Error:", err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement("a");
    a.href = resultImage;
    a.download = `easybuy-tryon-${product.id}.webp`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveLook = async () => {
    if (!resultImage || savingLook || savedLook) return;
    setSavingLook(true);
    try {
      const res = await fetch("/api/trial-room/looks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          imageUrl: resultImage,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not save look.");
      }
      setSavedLook(true);
      toast.success("Look saved to your account!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save look.";
      toast.error(msg);
    } finally {
      setSavingLook(false);
    }
  };

  const handleAddToCart = async () => {
    const success = await addItem({
      id: product.id,
      variantId: null,
      name: product.name,
      price: product.price,
      imageUrl: garmentImage,
      qty: 1,
    });
    if (success) {
      toast.success(`Added "${product.name}" to cart!`);
    }
  };

  const resetAll = () => {
    setPersonImage(null);
    setResultImage(null);
    setError(null);
    setSavedLook(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6 md:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => !loading && onClose()}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-[#E7DCC4] bg-[#FAF7F2] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E7DCC4] bg-white px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C05620]/10 text-[#C05620]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-[#2B2420]">
                  AI Virtual Trial Room
                </h2>
                <p className="text-xs text-[#8E3D14]/80">
                  See how <span className="font-medium">{product.name}</span> looks on you
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-full p-2 text-[#5C4D44] hover:bg-[#F7F2E7] transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto">
            {/* If user is not authenticated */}
            {!session?.user ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E7DCC4] bg-white p-8 text-center sm:p-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F2E7] text-[#C05620] mb-4">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#2B2420]">
                  Sign in to use the Virtual Trial Room
                </h3>
                <p className="mt-2 max-w-md text-sm text-[#8E3D14]/80">
                  Create a free account or sign in to try on any clothing with AI, save your favorite looks, and shop with confidence.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href={`/login?callbackUrl=/products/${product.id}`}
                    className="rounded-xl bg-[#2B2420] px-6 py-2.5 text-sm font-medium text-[#FAF7F2] hover:bg-[#3D332D] transition-colors shadow-sm"
                  >
                    Sign In to EasyBuy
                  </Link>
                  <button
                    onClick={onClose}
                    className="rounded-xl border border-[#E7DCC4] px-6 py-2.5 text-sm font-medium text-[#2B2420] hover:bg-white transition-colors"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            ) : resultImage && personImage ? (
              /* RESULT VIEW: Interactive Before / After Comparison */
              <div className="space-y-6">
                <BeforeAfterSlider
                  originalImage={personImage}
                  generatedImage={resultImage}
                  productTitle={product.name}
                />

                {/* Bottom Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E7DCC4] bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={resetAll}
                      className="flex items-center gap-1.5 rounded-xl border border-[#E7DCC4] bg-[#FAF7F2] px-3.5 py-2 text-xs sm:text-sm font-medium text-[#2B2420] hover:bg-white transition-colors"
                    >
                      <RotateCcw className="h-4 w-4 text-[#8E3D14]" />
                      Try Another Photo
                    </button>
                    <button
                      onClick={handleSaveLook}
                      disabled={savingLook || savedLook}
                      className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors ${
                        savedLook
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-[#E7DCC4] bg-[#FAF7F2] text-[#2B2420] hover:bg-white disabled:opacity-50"
                      }`}
                    >
                      {savedLook ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 text-emerald-600" />
                          Saved Look
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4 text-[#8E3D14]" />
                          {savingLook ? "Saving..." : "Save Look"}
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 rounded-xl border border-[#E7DCC4] bg-[#FAF7F2] px-3.5 py-2 text-xs sm:text-sm font-medium text-[#2B2420] hover:bg-white transition-colors"
                    >
                      <Download className="h-4 w-4 text-[#8E3D14]" />
                      Download
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 rounded-xl bg-[#C05620] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#A84918] transition-colors shadow-md hover:shadow-lg"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart · ৳{product.price.toLocaleString()}
                  </button>
                </div>
              </div>
            ) : loading ? (
              /* LOADING VIEW: Processing Animation */
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E7DCC4] bg-white py-16 px-6 text-center shadow-inner">
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full border-4 border-[#F0E6D2] border-t-[#C05620] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-[#C05620]">
                    <Sparkles className="h-8 w-8 animate-pulse" />
                  </div>
                </div>

                <h3 className="font-serif text-xl font-medium text-[#2B2420]">
                  Dressing you up in {product.name}...
                </h3>

                <p className="mt-3 text-sm font-medium text-[#C05620] min-h-6 transition-all">
                  {LOADING_MESSAGES[loadingStep]}
                </p>

                <p className="mt-2 text-xs text-[#8E3D14]/70 max-w-sm">
                  Our AI is analyzing posture, draping fabric folds, and blending ambient shadows. This usually takes around 15–25 seconds.
                </p>
              </div>
            ) : (
              /* INPUT VIEW: Photo Upload & Parameters */
              <div className="grid gap-6 lg:grid-cols-12">
                {/* Left Column: Garment Summary & Category */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-2xl border border-[#E7DCC4] bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8E3D14]/80 mb-3">
                      Selected Garment
                    </p>
                    <div className="flex gap-3">
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-[#E7DCC4] bg-[#F7F2E7]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={garmentImage}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-[#2B2420]">
                          {product.name}
                        </h4>
                        <p className="mt-1 text-sm font-serif font-bold text-[#C05620]">
                          ৳{product.price.toLocaleString()}
                        </p>
                        {product.category && (
                          <span className="mt-2 inline-block rounded-md bg-[#FAF7F2] border border-[#E7DCC4] px-2 py-0.5 text-[11px] font-medium text-[#8E3D14]">
                            {product.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category Selector */}
                  <div className="rounded-2xl border border-[#E7DCC4] bg-white p-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E3D14]/80 mb-2">
                      Garment Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Upper-body", "Lower-body", "Dress"] as GarmentCategory[]).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                            category === cat
                              ? "bg-[#2B2420] text-[#FAF7F2] shadow-sm"
                              : "border border-[#E7DCC4] bg-[#FAF7F2] text-[#2B2420] hover:bg-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Guidelines */}
                  <div className="rounded-2xl border border-[#E7DCC4] bg-[#F7F2E7] p-4 text-xs text-[#3A342C] space-y-2">
                    <p className="flex items-center gap-1.5 font-semibold text-[#8E3D14]">
                      <Info className="h-3.5 w-3.5" />
                      Tips for Best Results
                    </p>
                    <ul className="space-y-1 text-[#5C4D44] pl-4 list-disc marker:text-[#C05620]">
                      <li>Stand facing forward with arms slightly away from sides.</li>
                      <li>Ensure clear indoor or natural lighting.</li>
                      <li>Wear form-fitting or simple clothing for clean AI masking.</li>
                    </ul>
                  </div>
                </div>

                {/* Right Column: Person Photo Upload */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="flex-1 rounded-2xl border border-[#E7DCC4] bg-white p-6 flex flex-col justify-between">
                    <div>
                      {/* Header with Manage Gallery and Add Photo CTA */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#8E3D14]/80">
                            My Try-On Photos
                          </p>
                          <p className="text-[11px] text-[#5C4D44] mt-0.5">
                            Select a photo to try on or manage your personal gallery
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsGalleryManagerOpen(true)}
                            className="text-xs font-semibold text-[#8E3D14] hover:text-[#2B2420] inline-flex items-center gap-1.5 rounded-lg border border-[#E7DCC4] bg-[#FAF7F2] px-2.5 py-1.5 hover:bg-white transition-all shadow-xs"
                          >
                            <Layers className="h-3.5 w-3.5 text-[#C05620]" />
                            Manage Gallery
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-semibold text-[#C05620] hover:text-[#A84918] inline-flex items-center gap-1.5 rounded-lg border border-[#C05620]/30 bg-[#C05620]/10 px-2.5 py-1.5 hover:bg-[#C05620]/20 transition-all shadow-xs"
                          >
                            <UploadCloud className="h-3.5 w-3.5" />
                            + Add Photo
                          </button>
                        </div>
                      </div>

                      {/* Photo Gallery Strip */}
                      <div className="flex items-center gap-2.5 overflow-x-auto pb-2.5 pt-0.5">
                        {gallery.map((photo) => {
                          const isSelected = personImage === photo.url;
                          return (
                            <button
                              key={photo.id}
                              type="button"
                              onClick={() => {
                                setPersonImage(photo.url);
                                setResultImage(null);
                                setError(null);
                              }}
                              className={`group relative shrink-0 cursor-pointer rounded-xl border-2 transition-all p-0.5 text-left ${
                                isSelected
                                  ? "border-[#C05620] ring-2 ring-[#C05620]/25 shadow-sm"
                                  : "border-[#E7DCC4] hover:border-[#8E3D14]/40"
                              }`}
                            >
                              <div className="relative h-16 w-14 overflow-hidden rounded-lg bg-[#F7F2E7]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={photo.url}
                                  alt={photo.label}
                                  className="h-full w-full object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-[#C05620]/20 flex items-center justify-center">
                                    <div className="rounded-full bg-[#C05620] p-0.5 text-white shadow-sm">
                                      <Check className="h-3 w-3 stroke-[3]" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <p className="mt-0.5 max-w-[56px] truncate text-center text-[10px] font-medium text-[#5C4D44]">
                                {photo.label}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      {/* Main Preview of Selected Photo */}
                      {personImage ? (
                        <div className="relative h-60 sm:h-64 w-full overflow-hidden rounded-xl border border-[#E7DCC4] bg-[#F7F2E7] mt-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={personImage}
                            alt="Selected Try-On Photo"
                            className="h-full w-full object-contain"
                          />
                          {/* Bottom info pill */}
                          <div className="absolute bottom-2 left-2 rounded-lg bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                            {gallery.find((p) => p.url === personImage)?.label || "Selected Photo"}
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files?.[0]) {
                              handleFileUpload(e.dataTransfer.files[0]);
                            }
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-60 sm:h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E7DCC4] bg-[#FAF7F2] p-6 text-center hover:border-[#C05620] hover:bg-[#F7F2E7] transition-all mt-1"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#C05620] shadow-sm mb-2.5">
                            <UploadCloud className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-semibold text-[#2B2420]">
                            Click or drag photo here to upload
                          </p>
                          <p className="mt-1 text-xs text-[#8E3D14]/70">
                            PNG, JPG, or WebP up to 10MB
                          </p>
                          <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#E7DCC4] bg-white px-3 py-1 text-xs font-medium text-[#2B2420]">
                            <ImageIcon className="h-3.5 w-3.5 text-[#C05620]" />
                            Select from device
                          </span>
                        </div>
                      )}

                      <input
                        id={fileInputId}
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                    </div>

                    {/* Error display if any */}
                    {error && (
                      <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Try-on Submit CTA */}
                    <div className="mt-6 pt-4 border-t border-[#E7DCC4] flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-[#E7DCC4] px-5 py-2.5 text-sm font-medium text-[#2B2420] hover:bg-[#F7F2E7] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!personImage || loading}
                        onClick={handleGenerateTryOn}
                        className="flex items-center gap-2 rounded-xl bg-[#2B2420] px-6 py-2.5 text-sm font-semibold text-[#FAF7F2] hover:bg-[#3D332D] transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="h-4 w-4 text-[#E67E22]" />
                        Try It On Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* MANAGE GALLERY MODAL */}
      <AnimatePresence>
        {isGalleryManagerOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsGalleryManagerOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-[#E7DCC4] bg-[#FAF7F2] shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E7DCC4] bg-white px-6 py-4">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#2B2420]">
                    My Try-On Photo Gallery
                  </h3>
                  <p className="text-xs text-[#5C4D44] mt-0.5">
                    View, upload, and manage the personal photos you use for AI virtual fittings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGalleryManagerOpen(false)}
                  className="rounded-full p-1.5 text-neutral-400 hover:bg-[#FAF7F2] hover:text-[#2B2420] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Photo Grid */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {gallery.map((photo) => {
                    const isSelected = personImage === photo.url;
                    return (
                      <div
                        key={photo.id}
                        className={`relative flex flex-col overflow-hidden rounded-xl border bg-white p-2.5 transition-all shadow-xs ${
                          isSelected ? "border-[#C05620] ring-2 ring-[#C05620]/20" : "border-[#E7DCC4]"
                        }`}
                      >
                        <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-[#F7F2E7]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt={photo.label}
                            className="h-full w-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute top-2 left-2 rounded-full bg-[#C05620] px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                              Active Pose
                            </div>
                          )}
                        </div>
                        <div className="mt-2.5 flex items-center justify-between gap-1">
                          <span className="truncate text-xs font-semibold text-[#2B2420]">
                            {photo.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPhotoToDelete(photo)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete photo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPersonImage(photo.url);
                            setResultImage(null);
                            setError(null);
                            setIsGalleryManagerOpen(false);
                          }}
                          className={`mt-2 w-full rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                            isSelected
                              ? "bg-[#2B2420] text-white"
                              : "border border-[#E7DCC4] bg-[#FAF7F2] text-[#2B2420] hover:bg-white"
                          }`}
                        >
                          {isSelected ? "Selected" : "Use for Try-On"}
                        </button>
                      </div>
                    );
                  })}

                  {/* Upload Card */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-3/4 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E7DCC4] bg-[#FAF7F2] p-4 text-center hover:border-[#C05620] hover:bg-[#F7F2E7] transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#C05620] shadow-xs mb-2">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-[#2B2420]">Upload New Photo</p>
                    <p className="mt-1 text-[10px] text-[#8E3D14]/70">PNG, JPG, WebP</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[#E7DCC4] bg-white px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#5C4D44]">
                    {gallery.length} {gallery.length === 1 ? "photo" : "photos"} in gallery
                  </span>
                  <button
                    type="button"
                    onClick={handleRestoreDefaults}
                    className="text-xs font-semibold text-[#8E3D14] hover:underline transition-colors"
                  >
                    Restore Default Poses
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGalleryManagerOpen(false)}
                  className="rounded-xl bg-[#2B2420] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3D332D] transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL ALERT BOX FOR DELETING PHOTO */}
      <AnimatePresence>
        {photoToDelete && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setPhotoToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="relative z-10 w-full max-w-sm rounded-2xl border border-red-100 bg-white p-6 shadow-2xl text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3.5">
                <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2B2420]">
                Delete Try-On Photo?
              </h3>
              <p className="mt-2 text-xs text-[#5C4D44] leading-relaxed">
                Are you sure you want to remove <span className="font-semibold text-[#2B2420]">"{photoToDelete.label}"</span> from your try-on gallery? You can always upload it again later.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPhotoToDelete(null)}
                  className="flex-1 rounded-xl border border-[#E7DCC4] py-2.5 text-xs font-semibold text-[#2B2420] hover:bg-[#FAF7F2] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeletePhoto}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-700 shadow-xs transition-colors"
                >
                  Delete Photo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
