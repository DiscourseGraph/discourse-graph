import { Card, Spinner } from "@blueprintjs/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import fireQuery from "../utils/fireQuery";
import parseQuery from "../utils/parseQuery";
import type {
  QueryPageComponent,
  Result as SearchResult,
} from "roamjs-components/types/query-builder";
import ResultsView from "./ResultsView";
import ReactDOM from "react-dom";
import QueryEditor from "./QueryEditor";
import getSubTree from "roamjs-components/util/getSubTree";
import { createComponentRender } from "roamjs-components/components/ComponentContainer";
import getBasicTreeByParentUid from "roamjs-components/queries/getBasicTreeByParentUid";
import createBlock from "roamjs-components/writes/createBlock";
import deleteBlock from "roamjs-components/writes/deleteBlock";
import setInputSetting from "roamjs-components/util/setInputSetting";
import { OnloadArgs } from "roamjs-components/types/native";
import { StoredFilters } from "./DefaultFilters";

type Props = Parameters<QueryPageComponent>[0];

const ensureSetting = ({
  parentUid,
  key,
  value,
}: {
  parentUid: string;
  key: string;
  value: string;
}) => {
  const [first, second] = key.split(".");
  const tree = getBasicTreeByParentUid(parentUid);
  const node = getSubTree({ tree, key: first });
  return (
    node.uid
      ? Promise.resolve(node.uid)
      : createBlock({ parentUid, node: { text: first } })
  ).then((blockUid) =>
    setInputSetting({
      blockUid,
      key: second,
      value,
    })
  );
};

const QueryPage = ({
  pageUid,
  defaultReturnNode,
  getExportTypes,
  hideMetadata = false,
  globalFiltersData,
  globalPageSize,
}: Props) => {
  const tree = useMemo(() => getBasicTreeByParentUid(pageUid), [pageUid]);
  const [isEdit, _setIsEdit] = useState(
    () => !!getSubTree({ tree, key: "editing" }).uid
  );
  const [hasResults, setHasResults] = useState(
    () => !!getSubTree({ tree, key: "results" }).uid
  );
  const setIsEdit = useCallback(
    (b: boolean) => {
      _setIsEdit(b);
      return b
        ? createBlock({
            parentUid: pageUid,
            node: { text: "editing" },
            order: 2,
          })
        : deleteBlock(getSubTree({ parentUid: pageUid, key: "editing" }).uid);
    },
    [pageUid]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const onRefresh = useCallback(() => {
    setError("");
    setLoading(true);
    const args = parseQuery(pageUid);
    setTimeout(() => {
      const runFireQuery = (a: Parameters<typeof fireQuery>[0]) =>
        fireQuery(a)
          .then((results) => {
            setResults(results);
          })
          .catch(() => {
            setError(
              `Query failed to run. Try running a new query from the editor.`
            );
          })
          .finally(() => {
            const tree = getBasicTreeByParentUid(pageUid);
            const node = getSubTree({ tree, key: "results" });
            return (
              node.uid
                ? Promise.resolve(node.uid)
                : createBlock({ parentUid: pageUid, node: { text: "results" } })
            ).then(() => setHasResults(true));
          });
      (args.returnNode
        ? runFireQuery(args)
        : defaultReturnNode
        ? ensureSetting({
            key: "scratch.return",
            value: defaultReturnNode,
            parentUid: pageUid,
          }).then(() => {
            if (defaultReturnNode === "block" || defaultReturnNode === "node") {
              setIsEdit(true);
            } else {
              runFireQuery({ ...args, returnNode: defaultReturnNode });
            }
          })
        : setIsEdit(true)
      ).finally(() => {
        setLoading(false);
      });
    }, 1);
  }, [setResults, pageUid, setLoading, defaultReturnNode]);
  useEffect(() => {
    if (!isEdit) {
      onRefresh();
    }
  }, [isEdit, onRefresh]);
  useEffect(() => {
    const roamBlock = containerRef.current.closest(".rm-block-main");
    if (roamBlock) {
      const sep = roamBlock.querySelector<HTMLDivElement>(
        ".rm-block-separator"
      );
      if (sep) {
        sep.style.minWidth = "0";
      }
    }
  }, []);
  useEffect(() => {
    const main =
      containerRef.current.closest(".rm-block-main") ||
      containerRef.current.closest(".roamjs-query-page")?.parentElement;
    if (
      main.nextElementSibling &&
      main.nextElementSibling.classList.contains("rm-block-children")
    ) {
      main.nextElementSibling.classList.add("roamjs-query-builder-metadata");
    }
    const container = containerRef.current.closest<HTMLDivElement>(
      "div.roamjs-query-builder-parent"
    );
    if (container) {
      container.style.width = "unset";
    }
  }, []);
  return (
    <Card
      id={`roamjs-query-page-${pageUid}`}
      className={"roamjs-query-page p-0 overflow-auto"}
    >
      <div ref={containerRef}>
        {hideMetadata && (
          <style>
            {`.roamjs-query-builder-metadata.rm-block-children {
          display: none;
        }`}
          </style>
        )}
        {isEdit && (
          <>
            <QueryEditor
              parentUid={pageUid}
              onQuery={() => setIsEdit(false)}
              defaultReturnNode={defaultReturnNode}
            />
          </>
        )}
        {isEdit && hasResults && <hr style={{ borderColor: "#333333" }} />}
        {loading ? (
          <p className="px-8 py-4">
            <Spinner /> Loading Results...
          </p>
        ) : hasResults ? (
          <ResultsView
            parentUid={pageUid}
            onEdit={() => setIsEdit(true)}
            getExportTypes={getExportTypes}
            header={
              error ? <div className="text-red-700 mb-4">{error}</div> : <div />
            }
            results={results.map(({ id, ...a }) => a)}
            onRefresh={onRefresh}
            globalFiltersData={globalFiltersData}
            globalPageSize={globalPageSize}
          />
        ) : (
          <></>
        )}
      </div>
    </Card>
  );
};

const getSettings = (extensionAPI: OnloadArgs["extensionAPI"]) => {
  return {
    globalFiltersData: Object.fromEntries(
      Object.entries(
        (extensionAPI.settings.get("default-filters") as Record<
          string,
          StoredFilters
        >) || {}
      ).map(([k, v]) => [
        k,
        {
          includes: Object.fromEntries(
            Object.entries(v.includes).map(([k, v]) => [k, new Set(v)])
          ),
          excludes: Object.fromEntries(
            Object.entries(v.excludes).map(([k, v]) => [k, new Set(v)])
          ),
        },
      ])
    ),
    hideMetadata: !!extensionAPI.settings.get("hide-metadata"),
    globalPageSize:
      Number(extensionAPI.settings.get("default-page-size")) || 10,
  };
};

export const renderQueryBlock = (extensionAPI: OnloadArgs["extensionAPI"]) =>
  createComponentRender(
    ({ blockUid }) => (
      <QueryPage
        pageUid={blockUid}
        defaultReturnNode={"node"}
        // @ts-ignore
        {...getSettings(extensionAPI)}
      />
    ),
    "roamjs-query-builder-parent"
  );

export const render = ({
  parent,
  extensionAPI,
  ...props
}: { parent: HTMLElement; extensionAPI: OnloadArgs["extensionAPI"] } & Props) =>
  ReactDOM.render(
    <QueryPage
      {...props}
      // @ts-ignore
      {...getSettings(extensionAPI)}
    />,
    parent
  );

export default QueryPage;
