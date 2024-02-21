export enum Operator {
	Mul = '*',
	Add = '+',
	Mod = '%',
	Sin = 'sin(a)',
	Cos = 'cos(a)'
}

export type Operand = number | 'x';
export type Expression = Operator | Operand;
export type Stack = Expression[];

export function evaluate(stack: Stack): number {
	let stack_clone: Stack = Object.assign([], stack);
	let heap: number[] = [];
	let x = Date.now() / 1000;
	let a: number;
	let b: number;
	let temp: number;
	while (stack_clone.length > 0) {
		let op = stack_clone.pop();
		switch (op) {
			case Operator.Mul:
				a = heap.pop() || 0;
				b = heap.pop() || 0;
				temp = a * b;
				heap.push(temp);
				break;
			case Operator.Add:
				a = heap.pop() || 0;
				b = heap.pop() || 0;
				temp = a + b;
				heap.push(temp);
				break;
			case Operator.Mod:
				a = heap.pop() || 0;
				b = heap.pop() || 0;
				temp = a % b;
				heap.push(temp);
				break;
			case Operator.Sin:
				a = heap.pop() || 0;
				temp = Math.sin(a);
				heap.push(temp);
				break;
			case Operator.Cos:
				a = heap.pop() || 0;
				temp = Math.cos(a);
				heap.push(temp);
				break;
			case 'x':
				heap.push(x);
				break;
			default:
				heap.push(op as number);
		}
	}
	return heap.pop() || 0;
}
