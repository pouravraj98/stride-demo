export default function Finale({ show }) {
  return (
    <div className={`finale${show ? ' show' : ''}`}>
      <div className="f-ey">The Last Interface</div>
      <div className="f-t">Built with CometChat</div>
      <div className="f-s">
        Visual search &middot; Conversational shopping &middot; Checkout
        <br />
        One conversation. Every touchpoint.
      </div>
      <div className="f-p">cometchat.com</div>
    </div>
  );
}
