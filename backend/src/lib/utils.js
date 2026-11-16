import jwt from "jsonwebtoken";

export const getJwtCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true, // prevent XSS attacks
    sameSite: isProd ? "none" : "strict", // 'none' required for cross-site Vercel -> Render cookies
    secure: isProd,
  };
};

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    ...getJwtCookieOptions(),
  });

  return token;
};
