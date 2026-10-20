import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { z } from "zod";

import { initialSpaces } from "@/lib/data";
import { spaceSchema } from "@/lib/validation";
import type { Space, SpaceStatus } from "@/lib/types";

const storedSpaceSchema = spaceSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  imageUrl: z.string().url().or(z.literal("")),
  galleryUrls: z.array(z.string().url()),
  amenities: z.array(z.string()),
  services: z.array(z.string()),
});
const storedSpacesSchema = z.array(storedSpaceSchema);
const dataDirectory = process.env.PLACEORA_DATA_DIR || join(process.cwd(), ".placeora-data");
const spacesFile = join(dataDirectory, "spaces.json");

let initialization: Promise<void> | undefined;
let mutationQueue = Promise.resolve();

async function writeSpaces(spaces: Space[]) {
  await mkdir(dirname(spacesFile), { recursive: true });
  const temporaryFile = `${spacesFile}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(spaces, null, 2)}\n`, "utf8");
  await rename(temporaryFile, spacesFile);
}

async function ensureStore() {
  if (!initialization) {
    initialization = (async () => {
      await mkdir(dirname(spacesFile), { recursive: true });
      try {
        await readFile(spacesFile, "utf8");
      } catch (error) {
        if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
        await writeSpaces(initialSpaces);
      }
    })().catch((error) => {
      initialization = undefined;
      throw error;
    });
  }
  await initialization;
}

async function readSpaces(): Promise<Space[]> {
  await ensureStore();
  const contents = await readFile(spacesFile, "utf8");
  const parsed = storedSpacesSchema.safeParse(JSON.parse(contents));
  if (!parsed.success) throw new Error("The persisted spaces file contains invalid data.");
  return parsed.data;
}

function serializeMutation<T>(mutation: () => Promise<T>): Promise<T> {
  const result = mutationQueue.then(mutation);
  mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

export async function getSpaces() {
  return readSpaces();
}

export async function getActiveSpaces() {
  return (await readSpaces()).filter((space) => space.status === "ACTIVE");
}

export async function getSpaceById(id: string) {
  return (await readSpaces()).find((space) => space.id === id);
}

export async function createSpace(space: Space) {
  return serializeMutation(async () => {
    const spaces = await readSpaces();
    if (spaces.some((item) => item.id === space.id || item.slug === space.slug)) {
      throw new Error("An active space already uses this id or slug.");
    }
    spaces.unshift(space);
    await writeSpaces(spaces);
    return space;
  });
}

export async function replaceSpace(space: Space) {
  return serializeMutation(async () => {
    const spaces = await readSpaces();
    const index = spaces.findIndex((item) => item.id === space.id);
    if (index < 0) return null;
    if (spaces.some((item) => item.id !== space.id && item.slug === space.slug)) {
      throw new Error("Another space already uses this slug.");
    }
    spaces[index] = space;
    await writeSpaces(spaces);
    return space;
  });
}

export async function updateSpaceStatus(id: string, status: SpaceStatus) {
  return serializeMutation(async () => {
    const spaces = await readSpaces();
    const space = spaces.find((item) => item.id === id);
    if (!space) return null;
    const updatedSpace = { ...space, status, updatedAt: new Date().toISOString() };
    spaces[spaces.indexOf(space)] = updatedSpace;
    await writeSpaces(spaces);
    return updatedSpace;
  });
}
