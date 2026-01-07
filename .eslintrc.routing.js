// ESLint rules to prevent routing and React import issues
module.exports = {
  rules: {
    // Prevent nested Routes inside Route elements
    "no-nested-routes": {
      create(context) {
        return {
          JSXElement(node) {
            if (node.openingElement.name.name === "Route") {
              // Check if this Route has a Routes element in its children
              const hasNestedRoutes = node.children.some(
                (child) =>
                  child.type === "JSXElement" &&
                  child.openingElement.name.name === "Routes"
              );

              if (hasNestedRoutes) {
                context.report({
                  node,
                  message:
                    "Routes inside Route elements are forbidden. Use proper nesting with Outlet instead.",
                });
              }
            }
          },
        };
      },
    },

    // Ensure layouts use Outlet
    "layout-must-use-outlet": {
      create(context) {
        return {
          FunctionDeclaration(node) {
            const fileName = context.getFilename();
            if (
              fileName.includes("Layout.jsx") ||
              fileName.includes("layout.jsx")
            ) {
              // Check if function uses Outlet
              let hasOutlet = false;

              function checkForOutlet(node) {
                if (
                  node.type === "JSXElement" &&
                  node.openingElement.name.name === "Outlet"
                ) {
                  hasOutlet = true;
                }
                if (node.children) {
                  node.children.forEach(checkForOutlet);
                }
              }

              if (node.body) {
                checkForOutlet(node.body);
              }

              if (!hasOutlet) {
                context.report({
                  node,
                  message:
                    "Layout components must use <Outlet /> instead of children prop.",
                });
              }
            }
          },
        };
      },
    },

    // Ensure React is imported when using hooks
    "react-hooks-require-react": {
      create(context) {
        return {
          ImportDeclaration(node) {
            if (node.source.value === "react") {
              const hasReactImport = node.specifiers.some(
                (spec) =>
                  spec.type === "ImportDefaultSpecifier" &&
                  spec.local.name === "React"
              );

              const hasHookImports = node.specifiers.some(
                (spec) =>
                  spec.type === "ImportSpecifier" &&
                  [
                    "useState",
                    "useEffect",
                    "useCallback",
                    "useMemo",
                    "useRef",
                  ].includes(spec.imported.name)
              );

              if (hasHookImports && !hasReactImport) {
                context.report({
                  node,
                  message:
                    'When importing React hooks, you must also import React as default import to prevent "Cannot read properties of null" errors.',
                });
              }
            }
          },
        };
      },
    },
  },
};
