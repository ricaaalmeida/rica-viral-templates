import { useCallback, useEffect, useRef } from 'react';
import { ProjectState } from '@/contexts/ProjectContext';

function toUrlParams(state: ProjectState): URLSearchParams {
  const params = new URLSearchParams();

  // Step 1 - Canvas formato e fundo
  params.set('aspectRatio', state.aspectRatio);
  params.set('bgType', state.background.type);

  if (state.background.type === 'solid' && state.background.solid) {
    params.set('bgColor', state.background.solid.replace('#', ''));
  }

  if (state.background.type === 'gradient' && state.background.gradient) {
    const { angle, colors } = state.background.gradient;
    params.set('gradAngle', angle.toString());
    colors.forEach((color, index) => {
      params.set(`gradColor${index}`, color.replace('#', ''));
    });
  }

  params.set('borderEnabled', state.borders.enabled ? '1' : '0');
  params.set('borderThickness', state.borders.thickness.toString());
  params.set('borderColor', state.borders.color.replace('#', ''));
  params.set('borderOpacity', state.borders.opacity.toString());
  params.set('chromaKey', state.chromaKey ? '1' : '0');

  // Step 2 - Perfil
  if (state.profile.name.trim()) {
    params.set('profileName', state.profile.name);
  }

  if (state.profile.username.trim()) {
    params.set('profileUsername', state.profile.username);
  }

  if (state.profile.postText.trim()) {
    params.set('postText', state.profile.postText);
  }

  params.set('verified', state.profile.verified ? '1' : '0');
  params.set('showBadge', state.profile.showVerifiedBadge ? '1' : '0');

  // Step 2 - Tipografia e offsets
  params.set('profileSize', state.typography.profileSize.toString());
  params.set('profileOffsetX', state.typography.profileOffsetX.toString());
  params.set('profileOffsetY', state.typography.profileOffsetY.toString());
  params.set('nameSize', state.typography.nameSize.toString());
  params.set('usernameSize', state.typography.usernameSize.toString());
  params.set('postTextSize', state.typography.postTextSize.toString());
  params.set('postTextSpacing', state.typography.postTextSpacing.toString());
  params.set('contentSpacing', state.typography.contentSpacing.toString());
  params.set('nameColor', state.typography.nameColor.replace('#', ''));
  params.set('usernameColor', state.typography.usernameColor.replace('#', ''));
  params.set('postTextColor', state.typography.postTextColor.replace('#', ''));
  params.set('verifiedBadgeColor', state.typography.verifiedBadgeColor.replace('#', ''));
  params.set('nameOffsetX', state.typography.nameOffsetX.toString());
  params.set('nameOffsetY', state.typography.nameOffsetY.toString());
  params.set('usernameOffsetX', state.typography.usernameOffsetX.toString());
  params.set('usernameOffsetY', state.typography.usernameOffsetY.toString());
  params.set('nameUsernameSpacing', state.typography.nameUsernameSpacing.toString());
  params.set('badgeSize', state.typography.verifiedBadgeSize.toString());
  params.set('badgeOffsetX', state.typography.verifiedBadgeOffsetX.toString());
  params.set('badgeOffsetY', state.typography.verifiedBadgeOffsetY.toString());

  // Step 2 - Transformações
  params.set('headerOffsetX', state.transform.headerOffsetX.toString());
  params.set('headerOffsetY', state.transform.headerOffsetY.toString());
  params.set('headerFlipH', state.transform.headerFlipHorizontal ? '1' : '0');
  params.set('headerFlipV', state.transform.headerFlipVertical ? '1' : '0');
  params.set('contentOffsetX', state.transform.contentOffsetX.toString());
  params.set('contentOffsetY', state.transform.contentOffsetY.toString());
  params.set('contentFlipH', state.transform.contentFlipHorizontal ? '1' : '0');
  params.set('contentFlipV', state.transform.contentFlipVertical ? '1' : '0');
  params.set('postTextFlipH', state.transform.postTextFlipHorizontal ? '1' : '0');

  // Step 3 - Conteúdo
  params.set('imageCount', state.imageCount.toString());
  params.set('layoutPreset', state.layoutPreset);
  params.set('fullBleed', state.fullBleed ? '1' : '0');

  // Step 4 - Exportação
  params.set('exportMode', state.exportMode);
  params.set('resolution', state.resolution.toString());
  params.set('fps', state.fps.toString());

  return params;
}

function asBoolean(value: string | null): boolean | undefined {
  if (value === '1') return true;
  if (value === '0') return false;
  return undefined;
}

function asNumber(value: string | null): number | undefined {
  if (value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function withHash(value: string | null): string | undefined {
  if (!value) return undefined;
  return value.startsWith('#') ? value : `#${value}`;
}

export function readStateFromUrl(): {
  hasParams: boolean;
  state: Partial<ProjectState>;
} {
  if (typeof window === 'undefined') {
    return { hasParams: false, state: {} };
  }

  const searchParams = new URLSearchParams(window.location.search);
  if (!searchParams.toString()) {
    return { hasParams: false, state: {} };
  }

  const getParam = (key: string): string | null => {
    const values = searchParams.getAll(key);
    if (values.length === 0) return null;
    return values[values.length - 1];
  };

  const state: Partial<ProjectState> = {};

  const aspectRatio = getParam('aspectRatio');
  if (aspectRatio) {
    state.aspectRatio = aspectRatio as ProjectState['aspectRatio'];
  }

  const backgroundType = getParam('bgType');
  if (backgroundType === 'solid' || backgroundType === 'gradient') {
    state.background = { type: backgroundType };

    const solidColor = withHash(getParam('bgColor'));
    if (backgroundType === 'solid' && solidColor) {
      state.background.solid = solidColor;
    }

    if (backgroundType === 'gradient') {
      const gradientColors: string[] = [];
      let colorIndex = 0;
      while (searchParams.has(`gradColor${colorIndex}`)) {
        const color = withHash(getParam(`gradColor${colorIndex}`));
        if (color) {
          gradientColors.push(color);
        }
        colorIndex += 1;
      }

      const angle = asNumber(getParam('gradAngle'));
      if (angle !== undefined || gradientColors.length > 0) {
        state.background.gradient = {
          angle: angle ?? 0,
          colors: gradientColors.length > 0 ? gradientColors : ['#ffffff', '#000000'],
        };
      }
    }
  }

  const borderEnabled = asBoolean(getParam('borderEnabled'));
  const borderThickness = asNumber(getParam('borderThickness'));
  const borderColor = withHash(getParam('borderColor'));
  const borderOpacity = asNumber(getParam('borderOpacity'));
  if (
    borderEnabled !== undefined ||
    borderThickness !== undefined ||
    borderColor !== undefined ||
    borderOpacity !== undefined
  ) {
    state.borders = {
      enabled: borderEnabled ?? false,
      thickness: borderThickness ?? 0,
      color: borderColor ?? '#ffffff',
      opacity: borderOpacity ?? 1,
    };
  }

  const chromaKey = asBoolean(getParam('chromaKey'));
  if (chromaKey !== undefined) {
    state.chromaKey = chromaKey;
  }

  const profilePartial: Partial<ProjectState['profile']> = {};
  const profileName = getParam('profileName');
  const profileUsername = getParam('profileUsername');
  const postText = getParam('postText');
  const verified = asBoolean(getParam('verified'));
  const showBadge = asBoolean(getParam('showBadge'));

  if (profileName !== null) profilePartial.name = profileName;
  if (profileUsername !== null) profilePartial.username = profileUsername;
  if (postText !== null) profilePartial.postText = postText;
  if (verified !== undefined) profilePartial.verified = verified;
  if (showBadge !== undefined) profilePartial.showVerifiedBadge = showBadge;

  if (Object.keys(profilePartial).length > 0) {
    state.profile = profilePartial as ProjectState['profile'];
  }

  type NumericTypographyKey = {
    [K in keyof ProjectState['typography']]: ProjectState['typography'][K] extends number
      ? K
      : never;
  }[keyof ProjectState['typography']];

  const typographyNumericFields: Array<[NumericTypographyKey, string]> = [
    ['profileSize', 'profileSize'],
    ['profileOffsetX', 'profileOffsetX'],
    ['profileOffsetY', 'profileOffsetY'],
    ['nameSize', 'nameSize'],
    ['usernameSize', 'usernameSize'],
    ['postTextSize', 'postTextSize'],
    ['postTextSpacing', 'postTextSpacing'],
    ['contentSpacing', 'contentSpacing'],
    ['nameOffsetX', 'nameOffsetX'],
    ['nameOffsetY', 'nameOffsetY'],
    ['usernameOffsetX', 'usernameOffsetX'],
    ['usernameOffsetY', 'usernameOffsetY'],
    ['nameUsernameSpacing', 'nameUsernameSpacing'],
    ['verifiedBadgeSize', 'badgeSize'],
    ['verifiedBadgeOffsetX', 'badgeOffsetX'],
    ['verifiedBadgeOffsetY', 'badgeOffsetY'],
  ];

  const typography: Partial<ProjectState['typography']> = {};

  typographyNumericFields.forEach(([field, param]) => {
    const value = asNumber(getParam(param));
    if (value !== undefined) {
      typography[field] = value;
    }
  });

  const nameColor = withHash(getParam('nameColor'));
  const usernameColor = withHash(getParam('usernameColor'));
  const postTextColor = withHash(getParam('postTextColor'));
  const verifiedBadgeColor = withHash(getParam('verifiedBadgeColor'));

  if (nameColor) typography.nameColor = nameColor;
  if (usernameColor) typography.usernameColor = usernameColor;
  if (postTextColor) typography.postTextColor = postTextColor;
  if (verifiedBadgeColor) typography.verifiedBadgeColor = verifiedBadgeColor;

  if (Object.keys(typography).length > 0) {
    state.typography = typography as ProjectState['typography'];
  }

  type NumericTransformKey = {
    [K in keyof ProjectState['transform']]: ProjectState['transform'][K] extends number
      ? K
      : never;
  }[keyof ProjectState['transform']];

  const transformNumericFields: Array<[NumericTransformKey, string]> = [
    ['headerOffsetX', 'headerOffsetX'],
    ['headerOffsetY', 'headerOffsetY'],
    ['contentOffsetX', 'contentOffsetX'],
    ['contentOffsetY', 'contentOffsetY'],
  ];

  const transform: Partial<ProjectState['transform']> = {};

  transformNumericFields.forEach(([field, param]) => {
    const value = asNumber(getParam(param));
    if (value !== undefined) {
      transform[field] = value;
    }
  });

  const headerFlipH = asBoolean(getParam('headerFlipH'));
  if (headerFlipH !== undefined) transform.headerFlipHorizontal = headerFlipH;

  const headerFlipV = asBoolean(getParam('headerFlipV'));
  if (headerFlipV !== undefined) transform.headerFlipVertical = headerFlipV;

  const contentFlipH = asBoolean(getParam('contentFlipH'));
  if (contentFlipH !== undefined) transform.contentFlipHorizontal = contentFlipH;

  const contentFlipV = asBoolean(getParam('contentFlipV'));
  if (contentFlipV !== undefined) transform.contentFlipVertical = contentFlipV;

  const postTextFlipH = asBoolean(getParam('postTextFlipH'));
  if (postTextFlipH !== undefined) transform.postTextFlipHorizontal = postTextFlipH;

  if (Object.keys(transform).length > 0) {
    state.transform = transform as ProjectState['transform'];
  }

  const imageCount = asNumber(getParam('imageCount'));
  if (imageCount !== undefined) {
    state.imageCount = Math.min(Math.max(imageCount, 0), 3) as ProjectState['imageCount'];
  }

  const layoutPreset = getParam('layoutPreset');
  if (layoutPreset) {
    state.layoutPreset = layoutPreset as ProjectState['layoutPreset'];
  }

  const fullBleed = asBoolean(getParam('fullBleed'));
  if (fullBleed !== undefined) {
    state.fullBleed = fullBleed;
  }

  const exportMode = getParam('exportMode');
  if (exportMode === 'png' || exportMode === 'mp4') {
    state.exportMode = exportMode;
  }

  const resolution = asNumber(getParam('resolution'));
  if (resolution !== undefined) {
    state.resolution = resolution;
  }

  const fps = asNumber(getParam('fps'));
  if (fps === 24 || fps === 30) {
    state.fps = fps as ProjectState['fps'];
  }

  const hasRecognizedParams = Object.keys(state).length > 0;

  return {
    hasParams: hasRecognizedParams,
    state,
  };
}

export function useUrlSync(
  state: ProjectState,
  debounceMs = 500
): {
  copyShareLink: () => Promise<void>;
  getShareLink: () => string;
} {
  const paramsCacheRef = useRef<string>('');
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      const params = toUrlParams(state);
      const serialized = params.toString();

      if (serialized === paramsCacheRef.current) {
        return;
      }

      paramsCacheRef.current = serialized;
      const newUrl = serialized
        ? `${window.location.pathname}?${serialized}`
        : window.location.pathname;

      window.history.replaceState({}, '', newUrl);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [state, debounceMs]);

  const getShareLink = useCallback(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    const params = toUrlParams(state);
    const serialized = params.toString();
    return serialized
      ? `${window.location.origin}${window.location.pathname}?${serialized}`
      : `${window.location.origin}${window.location.pathname}`;
  }, [state]);

  const copyShareLink = useCallback(async () => {
    const shareLink = getShareLink();
    if (!shareLink) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareLink);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareLink;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      console.info('Share link copied to clipboard', shareLink);
    } catch (error) {
      console.error('Failed to copy share link', error);
    }
  }, [getShareLink]);

  return { copyShareLink, getShareLink };
}
