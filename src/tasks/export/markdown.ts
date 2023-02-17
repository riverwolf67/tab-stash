import {defineComponent, h, type PropType, type VNode} from "vue";

import {friendlyFolderName} from "../../model/bookmarks";
import {required} from "../../util";
import type {ExportBookmark, ExportFolder} from "./model";

const MD_LINK_QUOTABLES_RE = /\\|\[\]|\!\[/g;
const MD_URL_QUOTABLES_RE = /\\|\)/g;

function renderFolder(level: number, folder: ExportFolder): VNode {
  return h("div", {}, [
    h("div", {}, [
      `${"".padStart(level, "#")} ${friendlyFolderName(folder.title)}`,
    ]),
    ...folder.bookmarks.map(renderBookmark),
    ...(folder.folders.length > 0 ? [h("div", {}, [h("br")])] : []),
    ...folder.folders.map(f => renderFolder(level + 1, f)),
    h("div", {}, [h("br")]),
  ]);
}

function renderBookmark(node: ExportBookmark): VNode {
  return h("div", {}, [
    `- [${quote_title(node.title)}](`,
    h("a", {href: node.url}, [quote_url(node.url)]),
    `)`,
  ]);
}

function quote_emphasis(text: string): string {
  return text
    .replace(
      /(^|\s)([*_]+)(\S)/g,
      (str, ws, emph, rest) => `${ws}${emph.replace(/./g, "\\$&")}${rest}`,
    )
    .replace(
      /(\S)([*_]+)(\s|$)/g,
      (str, rest, emph, ws) => `${rest}${emph.replace(/./g, "\\$&")}${ws}`,
    );
}
function quote_title(text: string): string {
  return quote_emphasis(text.replace(MD_LINK_QUOTABLES_RE, x => `\\${x}`));
}
function quote_url(url: string): string {
  return url.replace(MD_URL_QUOTABLES_RE, x => `\\${x}`);
}

export default defineComponent({
  props: {
    folders: required(Object as PropType<ExportFolder[]>),
  },

  setup(props) {
    return () => props.folders.map(f => renderFolder(2, f));
  },
});
