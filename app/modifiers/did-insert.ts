import {modifier} from 'ember-modifier';

type Function = (element: Element) => void;
type ModifierArguments = [Function];

export default modifier((element: Element, [fn]: ModifierArguments) => {
  fn(element);
});
