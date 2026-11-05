import { useEffect, useState } from "react";
import api from "../api/axios";
import { site } from "../siteConfig";

const CACHE_KEY = "alexagro_contact_info";

// Built-in values, used until an admin saves their own and for any field left blank.
// addressBn is blank so the Bangla address still comes from the i18n dictionary.
const DEFAULTS = {
  address: site.address,
  addressBn: "",
  mapUrl: site.mapUrl,
  phone: site.phone,
  email: site.email,
  facebook: site.social.facebook,
};

export function mergeContactInfo(saved) {
  const info = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS)) if (saved?.[key]) info[key] = saved[key];
  return info;
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
}

// One request per page load, shared by the footer and the Contact page.
let request = null;

// Called after an admin saves, so the public pages in this tab show the new details at once.
export function cacheContactInfo(saved) {
  request = Promise.resolve(saved);
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(saved));
  } catch {
    // storage full or blocked: the next page load fetches it again
  }
}

export default function useContactInfo() {
  const [info, setInfo] = useState(() => mergeContactInfo(readCache()));

  useEffect(() => {
    let alive = true;
    request ||= api.get("/contact-info").then((res) => {
      cacheContactInfo(res.data);
      return res.data;
    });
    request
      .then((saved) => alive && setInfo(mergeContactInfo(saved)))
      .catch(() => {
        request = null; // keep showing cached/default details; retry on the next mount
      });
    return () => {
      alive = false;
    };
  }, []);

  return info;
}
