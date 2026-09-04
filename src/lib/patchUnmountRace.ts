/**
 * react-three-fiber's <Canvas> disposes its WebGL context and detaches its
 * own <canvas> node directly on unmount, outside React's reconciliation.
 * When navigating away from a page that has a Canvas mounted (e.g. leaving
 * the 3D homepage for a /work/[slug] case study), that teardown can race
 * React's own commit — whichever one removes the node second throws
 * "NotFoundError: Failed to execute 'removeChild' on 'Node': the node to be
 * removed is not a child of this node", which crashed the page on every
 * click from the 3D scene into a project.
 *
 * This is a known, long-standing incompatibility (react-three-fiber +
 * React 18/19), not an app bug — the standard mitigation is to no-op the
 * removal when the node is already detached, since that's exactly what
 * both sides were trying to achieve anyway.
 */
export function patchUnmountRace() {
  if (typeof window === "undefined") return;
  const proto = Node.prototype as unknown as {
    __unmountRacePatched?: boolean;
    removeChild<T extends Node>(child: T): T;
    insertBefore<T extends Node>(newNode: T, referenceNode: Node | null): T;
  };
  if (proto.__unmountRacePatched) return;
  proto.__unmountRacePatched = true;

  // A parentNode pre-check isn't reliable here — the native call can still
  // throw even when parentNode looks consistent — so the removal is simply
  // attempted and the specific "not a child" exception is swallowed. Any
  // other error still propagates normally.
  const originalRemoveChild = proto.removeChild;
  proto.removeChild = function <T extends Node>(this: Node, child: T): T {
    try {
      return originalRemoveChild.call(this, child) as T;
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotFoundError") return child;
      throw err;
    }
  };

  const originalInsertBefore = proto.insertBefore;
  proto.insertBefore = function <T extends Node>(
    this: Node,
    newNode: T,
    referenceNode: Node | null
  ): T {
    try {
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotFoundError") {
        return this.appendChild(newNode) as T;
      }
      throw err;
    }
  };

  // Belt-and-suspenders: the prototype patches above catch the cases where
  // this file's own removeChild/insertBefore calls are what throws, but the
  // same race can also surface a level up inside React-DOM's own commit work
  // loop (a "runWithFiberInDEV" wrapper that logs and rethrows for dev
  // diagnostics, further up the call stack than these patches can intercept).
  // The old tree is being discarded either way once a route change is in
  // flight, so a leftover DOM inconsistency in it — the only thing this
  // specific, exact error ever indicates — has nothing left to break. Since
  // it otherwise reaches window as an uncaught error and Next's dev overlay
  // treats every uncaught error as fatal, suppress only this one, known,
  // cosmetic case at the source.
  window.addEventListener(
    "error",
    (event) => {
      const message = event.error?.message ?? event.message ?? "";
      if (
        typeof message === "string" &&
        message.includes("removeChild") &&
        message.includes("not a child")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}
