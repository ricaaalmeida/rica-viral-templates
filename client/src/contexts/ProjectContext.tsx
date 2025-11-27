import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { readStateFromUrl, useUrlSync } from '@/hooks/useUrlState';

export type AspectRatio = '4:5' | '1:1' | '9:16' | '16:9' | '3:4' | '2:3' | '21:9';
export type LayoutPreset = '58/42' | '60/40' | '55/45' | '50/50' | '100/0';
export type BorderPreset = 'none' | 'white-4' | 'black-6';

export interface GradientConfig {
  angle: number;
  colors: string[];
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient';
  solid?: string;
  gradient?: GradientConfig;
}

export interface BorderConfig {
  enabled: boolean;
  thickness: number;
  color: string;
  opacity: number;
}

export interface ProfileConfig {
  image: string | null;
  name: string;
  username: string;
  verified: boolean;
  showVerifiedBadge: boolean;
  postText: string;
}

export interface TypographyConfig {
  profileSize: number;
  profileOffsetX: number;
  profileOffsetY: number;
  nameSize: number;
  usernameSize: number;
  postTextSize: number;
  postTextSpacing: number;
  contentSpacing: number;
  nameColor: string;
  usernameColor: string;
  postTextColor: string;
  verifiedBadgeColor: string;
  nameOffsetX: number;
  nameOffsetY: number;
  usernameOffsetX: number;
  usernameOffsetY: number;
  nameUsernameSpacing: number;
  verifiedBadgeSize: number;
  verifiedBadgeOffsetX: number;
  verifiedBadgeOffsetY: number;
}

export interface ImageFrame {
  id: string;
  blob: string | null;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

export interface VideoConfig {
  blob: string | null;
  trimStart: number;
  trimEnd: number;
  muted: boolean;
  overlay: {
    enabled: boolean;
    text: string;
  };
}

export interface TransformConfig {
  headerOffsetX: number;
  headerOffsetY: number;
  headerFlipHorizontal: boolean;
  headerFlipVertical: boolean;
  contentOffsetX: number;
  contentOffsetY: number;
  contentFlipHorizontal: boolean;
  contentFlipVertical: boolean;
  postTextFlipHorizontal: boolean;
}

export interface ProjectState {
  aspectRatio: AspectRatio;
  background: BackgroundConfig;
  borders: BorderConfig;
  chromaKey: boolean;
  profile: ProfileConfig;
  typography: TypographyConfig;
  transform: TransformConfig;
  imageCount: 0 | 1 | 2 | 3;
  images: ImageFrame[];
  video: VideoConfig;
  layoutPreset: LayoutPreset;
  fullBleed: boolean;
  exportMode: 'png' | 'mp4';
  resolution: number;
  fps: 24 | 30;
}

interface ProjectContextType {
  state: ProjectState;
  updateState: (updates: Partial<ProjectState>) => void;
  resetState: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  copyShareLink: () => Promise<void>;
  getShareLink: () => string;
}

interface ProjectDB extends DBSchema {
  drafts: {
    key: string;
    value: {
      id: string;
      state: ProjectState;
      timestamp: number;
    };
  };
}

const defaultState: ProjectState = {
  aspectRatio: '4:5',
  background: {
    type: 'solid',
    solid: '#ffffff',
  },
  borders: {
    enabled: false,
    thickness: 4,
    color: '#ffffff',
    opacity: 1,
  },
  chromaKey: true,
  profile: {
    image: null,
    name: '',
    username: '',
    verified: true,
    showVerifiedBadge: true,
    postText: '',
  },
  typography: {
    profileSize: 58,
    profileOffsetX: 0,
    profileOffsetY: -15,
    nameSize: 19,
    usernameSize: 12,
    postTextSize: 17,
    postTextSpacing: 25,
    contentSpacing: 150,
    nameColor: '#000000',
    usernameColor: '#666666',
    postTextColor: '#000000',
    verifiedBadgeColor: '#1DA1F2',
    nameOffsetX: -5,
    nameOffsetY: -5,
    usernameOffsetX: -5,
    usernameOffsetY: 10,
    nameUsernameSpacing: 4,
    verifiedBadgeSize: 16,
    verifiedBadgeOffsetX: 0,
    verifiedBadgeOffsetY: 0,
  },
  transform: {
    headerOffsetX: 0,
    headerOffsetY: 80,
    headerFlipHorizontal: false,
    headerFlipVertical: false,
    contentOffsetX: 0,
    contentOffsetY: -10,
    contentFlipHorizontal: false,
    contentFlipVertical: false,
    postTextFlipHorizontal: false,
  },
  imageCount: 2,
  images: [
    { id: '1', blob: null, position: { x: 0, y: 0 }, scale: 1, rotation: 0 },
    { id: '2', blob: null, position: { x: 0, y: 0 }, scale: 1, rotation: 0 },
  ],
  video: {
    blob: null,
    trimStart: 0,
    trimEnd: 0,
    muted: true,
    overlay: {
      enabled: false,
      text: '',
    },
  },
  layoutPreset: '50/50',
  fullBleed: true,
  exportMode: 'png',
  resolution: 1080,
  fps: 30,
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

let db: IDBPDatabase<ProjectDB> | null = null;

async function initDB() {
  if (!db) {
    db = await openDB<ProjectDB>('rica-viral-db', 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('drafts')) {
          database.createObjectStore('drafts', { keyPath: 'id' });
        }
      },
    });
  }
  return db;
}

function cloneImageFrame(frame: ImageFrame, index: number): ImageFrame {
  return {
    id: frame.id ?? String(index + 1),
    blob: frame.blob ?? null,
    position: {
      x: frame.position?.x ?? 0,
      y: frame.position?.y ?? 0,
    },
    scale: frame.scale ?? 1,
    rotation: frame.rotation ?? 0,
  };
}

function createEmptyFrame(id: number): ImageFrame {
  return {
    id: String(id),
    blob: null,
    position: { x: 0, y: 0 },
    scale: 1,
    rotation: 0,
  };
}

function cloneState(base: ProjectState): ProjectState {
  const mergedTypography: TypographyConfig = {
    ...defaultState.typography,
    ...(base.typography ?? ({} as TypographyConfig)),
  };

  const mergedProfile: ProfileConfig = {
    ...defaultState.profile,
    ...(base.profile ?? ({} as ProfileConfig)),
  };

  return {
    ...base,
    background: {
      ...base.background,
      gradient: base.background.gradient
        ? { ...base.background.gradient, colors: [...base.background.gradient.colors] }
        : undefined,
    },
    borders: { ...base.borders },
    profile: mergedProfile,
    typography: mergedTypography,
    transform: { ...base.transform },
    video: {
      ...base.video,
      overlay: { ...base.video.overlay },
    },
    images: base.images.map(cloneImageFrame),
  };
}

function clampImageCount(value: number): ProjectState['imageCount'] {
  const clamped = Math.min(Math.max(Math.round(value), 0), 3);
  return clamped as ProjectState['imageCount'];
}

function mergeProjectState(base: ProjectState, overrides: Partial<ProjectState>): ProjectState {
  const next = cloneState(base);

  if (overrides.aspectRatio) {
    next.aspectRatio = overrides.aspectRatio;
  }

  if (overrides.background) {
    if (overrides.background.type) {
      next.background.type = overrides.background.type;
      if (overrides.background.type === 'solid') {
        next.background.gradient = undefined;
      }
    }
    if (overrides.background.solid !== undefined) {
      next.background.solid = overrides.background.solid ?? next.background.solid;
    }
    if (overrides.background.gradient) {
      next.background.gradient = {
        angle:
          overrides.background.gradient.angle ??
          next.background.gradient?.angle ??
          0,
        colors:
          overrides.background.gradient.colors
            ? [...overrides.background.gradient.colors]
            : next.background.gradient?.colors
            ? [...next.background.gradient.colors]
            : ['#ffffff', '#000000'],
      };
    }
  }

  if (overrides.borders) {
    next.borders = { ...next.borders, ...overrides.borders };
  }

  if (overrides.chromaKey !== undefined) {
    next.chromaKey = overrides.chromaKey;
  }

  if (overrides.profile) {
    next.profile = { ...next.profile, ...overrides.profile };
  }

  if (overrides.typography) {
    next.typography = { ...next.typography, ...overrides.typography };
  }

  if (overrides.transform) {
    next.transform = { ...next.transform, ...overrides.transform };
  }

  if (overrides.imageCount !== undefined) {
    next.imageCount = clampImageCount(overrides.imageCount);
  }

  if (overrides.images) {
    next.images = overrides.images.map((frame, index) => {
      const current = next.images[index] ?? createEmptyFrame(index + 1);
      return {
        ...current,
        ...frame,
        position: {
          ...current.position,
          ...(frame.position ?? {}),
        },
      };
    });
  }

  if (next.imageCount === 0) {
    next.images = [];
  } else {
    while (next.images.length < next.imageCount) {
      next.images.push(createEmptyFrame(next.images.length + 1));
    }
    if (next.images.length > next.imageCount) {
      next.images = next.images.slice(0, next.imageCount);
    }
  }

  if (overrides.video) {
    next.video = {
      ...next.video,
      ...overrides.video,
      overlay: {
        ...next.video.overlay,
        ...(overrides.video.overlay ?? {}),
      },
    };
  }

  if (overrides.layoutPreset) {
    next.layoutPreset = overrides.layoutPreset;
  }

  if (overrides.fullBleed !== undefined) {
    next.fullBleed = overrides.fullBleed;
  }

  if (overrides.exportMode) {
    next.exportMode = overrides.exportMode;
  }

  if (overrides.resolution !== undefined) {
    next.resolution = overrides.resolution;
  }

  if (overrides.fps !== undefined) {
    next.fps = overrides.fps;
  }

  return next;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const urlSnapshot = useRef(readStateFromUrl());

  const [state, setState] = useState<ProjectState>(() =>
    mergeProjectState(defaultState, urlSnapshot.current.state)
  );
  const [currentStep, setCurrentStep] = useState(1);

  const updateState = (updates: Partial<ProjectState>) => {
    setState((prev) => mergeProjectState(prev, updates));
  };

  const { copyShareLink, getShareLink } = useUrlSync(state);

  useEffect(() => {
    async function loadDraft() {
      if (urlSnapshot.current.hasParams) {
        return;
      }

      try {
        const database = await initDB();
        const draft = await database.get('drafts', 'current');
        if (draft) {
          setState(mergeProjectState(draft.state, {}));
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }

    loadDraft();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const database = await initDB();
        await database.put('drafts', {
          id: 'current',
          state,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [state]);

  const resetState = async () => {
    const freshState = mergeProjectState(defaultState, {});
    setState(freshState);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const database = await initDB();
      await database.delete('drafts', 'current');
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        state,
        updateState,
        resetState,
        currentStep,
        setCurrentStep,
        copyShareLink,
        getShareLink,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
