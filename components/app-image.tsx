import type { ImgHTMLAttributes } from "react";
type Props = ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; fill?: boolean };
export default function Image({ priority, fill, style, ...props }: Props) {
  return <img loading={priority ? "eager" : "lazy"} style={fill ? { position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", ...style } : style} {...props} />;
}
