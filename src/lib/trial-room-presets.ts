export type DemoAvatar = {
  id: string;
  name: string;
  gender: "female" | "male";
  imageUrl: string;
  description: string;
};

export const DEFAULT_TEST_AVATAR: string = "/trial-room/avatars/female/female-avatar-01-tank-jeans.png";

export const DEMO_AVATARS: DemoAvatar[] = [
  {
    id: "female-01",
    name: "Elena (Classic Front)",
    gender: "female",
    imageUrl: "/trial-room/avatars/female/female-avatar-01-tank-jeans.png",
    description: "Neutral white tank & denim, ideal baseline for upper-body and dresses",
  },
  {
    id: "female-02",
    name: "Aria (Streetwear)",
    gender: "female",
    imageUrl: "/trial-room/avatars/female/female-avatar-02-pinkhair-crop-skirt.png",
    description: "Crop top with skirt, clean pose for dresses and separates",
  },
  {
    id: "female-03",
    name: "Chloe (Blonde / Casual)",
    gender: "female",
    imageUrl: "/trial-room/avatars/female/female-avatar-03-blonde-tank-jeans.png",
    description: "Full-body frontal pose, optimal for tops and jackets",
  },
  {
    id: "female-04",
    name: "Zara (Afro Chic)",
    gender: "female",
    imageUrl: "/trial-room/avatars/female/female-avatar-04-afro-yellowcrop-skirt.png",
    description: "High contrast yellow crop, great for modern tops & skirts",
  },
  {
    id: "female-05",
    name: "Maya (Everyday Casual)",
    gender: "female",
    imageUrl: "/trial-room/avatars/female/female-avatar-05-pink-top-black-pants.jpg",
    description: "Pink tee with slim pants, versatile everyday look",
  },
  {
    id: "female-08",
    name: "Nora (Minimalist)",
    gender: "female",
    imageUrl: "/trial-room/avatars/female/female-avatar-08-bobhair-tank-jeans.png",
    description: "Minimalist bob & neutral tank, standard VTON benchmark",
  },
  {
    id: "female-13",
    name: "Sophia (Studio VTON)",
    gender: "female",
    imageUrl: "/trial-room/avatars/female/female-avatar-13-viton-model3-tank-jeans.png",
    description: "VITON-HD benchmark standard studio pose",
  },
  {
    id: "male-01",
    name: "Marcus (Athletic Tank)",
    gender: "male",
    imageUrl: "/trial-room/avatars/male/male-avatar-01-athletic-tank-jeans.png",
    description: "Neutral athletic tank & jeans, prime baseline for shirts and sweaters",
  },
  {
    id: "male-02",
    name: "Kenji (Casual Denim)",
    gender: "male",
    imageUrl: "/trial-room/avatars/male/male-avatar-02-asian-athletic-tank-jeans.png",
    description: "Clean studio pose, optimal for casual and formal shirts",
  },
  {
    id: "male-03",
    name: "Darius (Sportswear)",
    gender: "male",
    imageUrl: "/trial-room/avatars/male/male-avatar-03-black-athletic-navy-top.png",
    description: "Athletic navy top, great for jackets and overcoats",
  },
  {
    id: "male-04",
    name: "Simon (Summer Fit)",
    gender: "male",
    imageUrl: "/trial-room/avatars/male/male-avatar-04-catvton-simon-tank-shorts.png",
    description: "Tank and shorts, benchmark for both upper and lower body try-ons",
  },
];
