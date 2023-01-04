import { BroadcastChannel } from 'broadcast-channel';

const cb = new BroadcastChannel<{
  event: string;
  data: unknown;
}>('signageful');

cb.onmessage = (ev) => {
  console.log('this is a message??');
  console.log(ev);
};
