import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; children: ReactNode };
export default function Link({ href, children, ...props }: Props) {
  if (href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return <a href={href} {...props}>{children}</a>;
  return <RouterLink to={href} {...props}>{children}</RouterLink>;
}
