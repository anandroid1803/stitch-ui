import { nanoid } from 'nanoid';

export const generateId = () => nanoid();

export const generateElementId = () => `el_${nanoid(10)}`;

export const generateSlideId = () => `sl_${nanoid(10)}`;

export const generateDocumentId = () => `doc_${nanoid(12)}`;
