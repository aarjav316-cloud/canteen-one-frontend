import { useEffect, useState } from "react";
import { BellDot } from "lucide-react";
import { connectSocket, socket } from "../../lib/socket";
export default function KitchenPage() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    connectSocket();
    socket.emit("join_kitchen_room");
    const onNewOrder = (payload) => {
      setEvents((prev) => {
        if (prev.some((item) => item.orderId === payload.orderId)) {
          return prev;
        }
        return [{ ...payload, receivedAt: new Date().toISOString() }, ...prev].slice(0, 24);
      });
    };
    socket.on("new_order", onNewOrder);
    return () => {
      socket.off("new_order", onNewOrder);
    };
  }, []);
  return (
    <section className="pt-2">
      <div className="lux-card min-h-[500px]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cocoa-500">Kitchen queue</p>
            <h2 className="mt-1 font-display text-3xl text-cocoa-900">Incoming orders</h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-cocoa-700">
            <BellDot size={14} />
            Live
          </span>
        </div>
        <div className="mt-5 space-y-3">
          {events.length === 0 ? (
            <p className="rounded-xl border border-dashed border-sand-300 p-4 text-sm text-cocoa-700">No live orders yet.</p>
          ) : (
            events.map((item) => (
              <article key={`${item.orderId}_${item.receivedAt}`} className="rounded-xl border border-sand-300 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cocoa-500">Order #{item.orderId.slice(-8)}</p>
                <p className="mt-1 text-sm text-cocoa-700">Amount: Rs. {item.totalAmount}</p>
                <p className="mt-1 text-xs text-cocoa-500">{new Date(item.receivedAt).toLocaleTimeString()}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
