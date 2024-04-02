import { CACHE_HEADERS } from '../constants/cache';
import { File, ReadDirectorySuccessResult } from '../providers/provider';
import htmlTemplate from '../templates/directoryListing.out';
import { toReadableBytes } from '../utils/object';

const handlebarsTemplate = Handlebars.template(htmlTemplate);

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Render a directory listing
 *
 * TODO: Work with other teams on removing their dependency on nginx's listing
 *  result so we don't need to emulate it
 */
export default async (
  url: URL,
  result: ReadDirectorySuccessResult
): Promise<Response> => {
  const tableElements: TableElement[] = [];

  for (const name of result.subdirectories) {
    tableElements.push(renderSubdirectory(name));
  }

  let directoryLastModified: Date | undefined = undefined;
  const urlPathname = `${url.pathname}${url.pathname.endsWith('/') ? '' : '/'}`;
  for (const file of result.files) {
    if (
      directoryLastModified === undefined ||
      file.lastModified > directoryLastModified
    ) {
      directoryLastModified = file.lastModified;
    }

    tableElements.push(renderFile(urlPathname, file));
  }

  const html = handlebarsTemplate({
    pathname: url.pathname,
    entries: tableElements,
  });

  return new Response(html, {
    headers: {
      'last-modified': (directoryLastModified ?? new Date()).toUTCString(),
      'content-type': 'text/html',
      'cache-control': CACHE_HEADERS.success,
    },
  });
};

/**
 * Element to be displayed on the directory listing page
 */
type TableElement = {
  href: string;
  name: string;
  displayNamePaddingRight: string;
  lastModified: string;
  size: string;
};

function renderSubdirectory(name: string): TableElement {
  const href = encodeURIComponent(name.substring(0, name.length - 1));

  let displayName: string;
  let displayNamePaddingRight: string;
  if (name.length > 50) {
    displayName = name.substring(0, 49) + '>';
    displayNamePaddingRight = '';
  } else {
    displayName = name;
    displayNamePaddingRight = ' '.repeat(50 - name.length);
  }

  return {
    href: `${href}/`,
    name: displayName,
    displayNamePaddingRight,
    lastModified: '               -',
    size: '                  -',
  };
}

function renderFile(pathPrefix: string, file: File): TableElement {
  const { name, lastModified } = file;

  let displayName: string;
  let displayNamePaddingRight: string;
  if (name!.length > 50) {
    displayName = name.substring(0, 47) + '..>';
    displayNamePaddingRight = '';
  } else {
    displayName = name;
    displayNamePaddingRight = ' '.repeat(50 - name!.length);
  }

  const dateString = `${lastModified.getUTCDay()}-${months.at(
    lastModified.getUTCMonth()
  )}-${lastModified.getUTCFullYear()} ${lastModified.getUTCHours()}:${lastModified.getUTCMinutes()}`;

  const bytes = toReadableBytes(file.size);

  return {
    href: pathPrefix + encodeURIComponent(name),
    name: displayName,
    displayNamePaddingRight,
    lastModified: dateString,
    size: ' '.repeat(20 - bytes.length) + bytes,
  };
}
