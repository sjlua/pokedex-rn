import { useEffect } from "react";
import { Platform } from "react-native";

interface HeadProps {
  title?: string;
  description?: string;
}

/**
 * Head component for setting page metadata on web
 * Sets the document title and meta description for better PWA/SEO support
 */
export default function Head({ title, description }: HeadProps) {
  useEffect(() => {
    if (Platform.OS === "web") {
      // Set document title
      if (title) {
        document.title = title;
      }

      // Set meta description
      if (description) {
        let metaDescription = document.querySelector(
          'meta[name="description"]',
        );

        if (!metaDescription) {
          metaDescription = document.createElement("meta");
          metaDescription.setAttribute("name", "description");
          document.head.appendChild(metaDescription);
        }

        metaDescription.setAttribute("content", description);
      }

      // Override favicon with the Dexern logo PNG
      let favicon = document.querySelector(
        'link[rel="icon"]',
      ) as HTMLLinkElement | null;
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.setAttribute("rel", "icon");
        document.head.appendChild(favicon);
      }
      favicon.setAttribute("type", "image/png");
      favicon.setAttribute("href", "/dexern/favicon.png");
    }
  }, [title, description]);

  return null;
}
