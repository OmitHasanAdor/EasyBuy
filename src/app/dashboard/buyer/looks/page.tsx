"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Trash2,
  Download,
  ExternalLink,
  ArrowRight,
  UploadCloud,
  AlertTriangle,
  Layers,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type TryOnLook = {
  id: string;
  productId: number;
  productName: string;
  imageUrl: string;
  createdAt: string;
};

type UserGalleryPhoto = {
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

export default function BuyerLooksPage() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<"looks" | "photos">("looks");

  // Photos gallery state
  const [gallery, setGallery] = useState<UserGalleryPhoto[]>([]);
  const [photoToDelete, setPhotoToDelete] = useState<UserGalleryPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load photos from localStorage
  useEffect(() => {
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
      } catch {}
    }

    setGallery(photos);
  }, [session?.user]);

  // Handle file upload
  const handleFileUpload = (file: File) => {
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
        label: `Pose ${gallery.length + 1}`,
      };

      const updated = [newPhoto, ...gallery];
      setGallery(updated);

      const storageKey = `easybuy_gallery_${session?.user?.id || session?.user?.email || "guest"}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}

      toast.success("Photo added to your personal try-on gallery!");
    };
    reader.readAsDataURL(file);
  };

  // Confirm delete of photo with Modal Alert Box
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
    } catch {}

    toast.success(`Removed "${photoToDelete.label}" from your gallery.`);
    setPhotoToDelete(null);
  };

  const handleRestoreDefaults = () => {
    const defaults = getInitialUserPhotos(session?.user);
    setGallery(defaults);
    const storageKey = `easybuy_gallery_${session?.user?.id || session?.user?.email || "guest"}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(defaults));
    } catch {}
    toast.success("Restored default try-on photos!");
  };

  // Query saved looks from database
  const { data: looks = [], isLoading } = useQuery<TryOnLook[]>({
    queryKey: ["my-looks"],
    queryFn: async () => {
      const res = await fetch("/api/trial-room/looks");
      const data = await res.json();
      return data.success ? data.looks : [];
    },
  });

  const handleDeleteLook = async (id: string) => {
    try {
      const res = await fetch(`/api/trial-room/looks?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete look.");
      }
      toast.success("Look removed from your collection.");
      queryClient.setQueryData<TryOnLook[]>(["my-looks"], (old = []) =>
        old.filter((item) => item.id !== id)
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not delete look.";
      toast.error(msg);
    }
  };

  const handleDownload = (imageUrl: string, productName: string) => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `easybuy-${productName.toLowerCase().replace(/\s+/g, "-")}-look.webp`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section className="w-full bg-[#FBF8F1] px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#C05620] mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Virtual Fitting</span>
            </div>
            <h1 className="font-serif text-3xl font-medium text-[#2B2420]">
              {activeTab === "looks" ? "My Saved Looks" : "My Try-On Photo Gallery"}
            </h1>
            <p className="mt-1 text-sm text-[#5C4D44]">
              {activeTab === "looks"
                ? "Revisit and manage the virtual try-on looks you created with EasyBuy AI."
                : "Manage the personal photos and poses you use to try on clothes virtually."}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === "photos" && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-[#C05620]/30 bg-[#C05620] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#A84918] transition-colors"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>+ Upload Photo</span>
              </button>
            )}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#E7DCC4] bg-white px-4 py-2 text-xs font-semibold text-[#2B2420] shadow-xs hover:border-[#8E3D14] hover:bg-[#FAF7F2] transition-colors"
            >
              <span>Explore Fashion Catalog</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#8E3D14]" />
            </Link>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mb-8 flex items-center gap-2 border-b border-[#E7DCC4] pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("looks")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "looks"
                ? "border-[#C05620] text-[#C05620]"
                : "border-transparent text-[#5C4D44] hover:text-[#2B2420]"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Saved Looks ({looks.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "photos"
                ? "border-[#C05620] text-[#C05620]"
                : "border-transparent text-[#5C4D44] hover:text-[#2B2420]"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Try-On Photos ({gallery.length})</span>
          </button>
        </div>

        {/* TAB 1: SAVED LOOKS */}
        {activeTab === "looks" && (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-[#E7DCC4] bg-white p-4 shadow-sm animate-pulse"
                  >
                    <div className="aspect-3/4 w-full rounded-xl bg-[#F0E6D2]" />
                    <div className="mt-4 h-4 w-3/4 rounded bg-[#F0E6D2]" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-[#F0E6D2]" />
                  </div>
                ))}
              </div>
            ) : looks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#E7DCC4] bg-white p-12 text-center sm:p-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F2E7] text-[#C05620] mb-4">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h2 className="font-serif text-2xl font-medium text-[#2B2420]">No Saved Looks Yet</h2>
                <p className="mt-2 max-w-md text-sm text-[#5C4D44]">
                  Browse our fashion catalog, tap <span className="font-semibold text-[#8E3D14]">Virtual Trial Room</span> on any clothing item, and save your photo composite to revisit anytime.
                </p>
                <Link
                  href="/products"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2B2420] px-6 py-3 text-sm font-semibold text-[#FAF7F2] hover:bg-[#3D332D] shadow-sm transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-[#E67E22]" />
                  Explore Fashion Catalog
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {looks.map((look) => (
                  <motion.div
                    key={look.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#E7DCC4] bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Look composite image */}
                    <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl bg-[#F2EADA]">
                      <Image
                        src={look.imageUrl}
                        alt={look.productName}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-103"
                        unoptimized
                      />

                      {/* Top-right floating actions */}
                      <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleDownload(look.imageUrl, look.productName)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2B2420]/80 text-white shadow-sm backdrop-blur-xs hover:bg-[#2B2420] transition-colors"
                          title="Download look"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLook(look.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600/80 text-white shadow-sm backdrop-blur-xs hover:bg-red-600 transition-colors"
                          title="Remove from saved looks"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Info & links */}
                    <div className="mt-4 flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-base font-semibold text-[#2B2420] line-clamp-1">
                          {look.productName}
                        </h3>
                        <p className="mt-1 text-xs text-[#8E3D14]/80">
                          Tried on {new Date(look.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#F0E6D2]">
                        <Link
                          href={`/products/${look.productId}`}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E7DCC4] bg-[#FAF7F2] py-2 text-xs font-semibold text-[#2B2420] hover:bg-white hover:border-[#8E3D14] hover:text-[#8E3D14] transition-colors"
                        >
                          <span>View Product</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB 2: MY TRY-ON PHOTOS */}
        {activeTab === "photos" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7DCC4] pb-4">
              <div>
                <h2 className="font-serif text-lg font-semibold text-[#2B2420]">Personal Model Gallery</h2>
                <p className="text-xs text-[#5C4D44] mt-0.5">
                  Manage the photos used as your model in the AI Virtual Trial Room.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="rounded-xl border border-[#E7DCC4] bg-[#FAF7F2] px-4 py-2 text-xs font-semibold text-[#8E3D14] hover:bg-white hover:border-[#8E3D14] transition-colors"
              >
                Restore Default Poses
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {gallery.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E7DCC4] bg-white p-3 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl bg-[#F7F2E7]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.label}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2 opacity-90 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setPhotoToDelete(photo)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600/90 text-white shadow-sm hover:bg-red-700 transition-colors"
                        title="Delete photo from gallery"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#2B2420] truncate">
                      {photo.label}
                    </span>
                    <span className="text-[10px] text-[#8E3D14]/70 bg-[#FAF7F2] border border-[#E7DCC4] px-1.5 py-0.5 rounded">
                      Ready
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Upload Card */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-3/4 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E7DCC4] bg-[#FAF7F2] p-6 text-center hover:border-[#C05620] hover:bg-[#F7F2E7] transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#C05620] shadow-xs mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-[#2B2420]">Upload New Pose</p>
                <p className="mt-1 text-xs text-[#8E3D14]/70">PNG, JPG, or WebP up to 10MB</p>
              </div>
            </div>

            <input
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
        )}

        {/* CONFIRMATION MODAL ALERT BOX FOR DELETING PHOTO */}
        <AnimatePresence>
          {photoToDelete && (
            <div key="delete-photo-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                  Are you sure you want to remove <span className="font-semibold text-[#2B2420]">"{photoToDelete.label}"</span> from your try-on gallery? You can upload it again anytime.
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
      </div>
    </section>
  );
}
