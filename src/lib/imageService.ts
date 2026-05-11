import type { LocalImageService } from "astro";
import { baseService } from "astro/assets";
import sharpService, {
  type SharpImageServiceConfig,
} from "astro/assets/services/sharp";
import sharp from "sharp";

type LocalImageTransform = {
  src: string;
  [key: string]: any;
};

sharp.cache(false);

const trimmedService: LocalImageService<SharpImageServiceConfig> = {
  ...baseService,
  propertiesToHash: [...(baseService.propertiesToHash || []), "trim"],
  async transform(
    inputBuffer: Uint8Array,
    transformOptions: LocalImageTransform,
    config,
  ) {
    let { data, format } = await sharpService.transform(
      inputBuffer,
      transformOptions,
      config,
    );

    if (transformOptions.trim) {
      const pipeline = sharp(data);

      const { data: trimBuffer, info } = await pipeline
        .trim()
        .toBuffer({ resolveWithObject: true });

      const square = Math.max(info.width, info.height);

      const buf = await sharp(trimBuffer)
        .resize(square, square, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();

      data = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }

    return {
      data,
      format,
    };
  },
  async getURL(options, imageConfig) {
    let url = await baseService.getURL(options, imageConfig);

    if (options.trim) {
      if (url.includes("?")) {
        url += "&trim=1";
      } else {
        url += "?trim=1";
      }
    }

    return url;
  },
  parseURL(url, imageConfig) {
    const res = baseService.parseURL(url, imageConfig);

    if (!res) {
      return undefined;
    }

    const trim = url.searchParams.get("trim") === "1";

    if (res instanceof Promise) {
      return res.then((result) => {
        if (!result) {
          return undefined;
        }

        return {
          ...result,
          trim,
        };
      }) as Promise<LocalImageTransform> | Promise<undefined>;
    }

    return {
      ...res,
      trim,
    };
  },
};

export default trimmedService;
