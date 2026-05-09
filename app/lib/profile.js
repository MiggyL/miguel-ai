// Single-source identity strings used in the sticky header.
// Kept byte-identical across the four miguel-* repos —
// miguel-tests/static/parity.mjs enforces this.
//
// STATUS renders inside a green pill (the eye-catching part).
// DETAIL renders as plain gray text after the pill.
// AVAILABILITY is the joined plain-text form, kept for any future
// text-only consumer (SEO meta, structured data, etc).
export const STATUS = 'Open to work';
export const DETAIL = 'AI Engineer · Manila or remote';
export const AVAILABILITY = `${STATUS} · ${DETAIL}`;
