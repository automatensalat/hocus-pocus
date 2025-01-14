import { createFunction } from "./create-function";
import { Selection, Position } from "./editor";
import {
  createShouldUpdateCodeFor,
  createShouldNotUpdateCodeFor
} from "./test-helpers";

const shouldUpdateCodeFor = createShouldUpdateCodeFor(createFunction);
const shouldNotUpdateCodeFor = createShouldNotUpdateCodeFor(createFunction);

describe("create function declaration from a call expression", () => {
  it("with nothing else", () => {
    const code = "readCode();";
    const selection = Selection.cursorAt(0, 0);

    shouldUpdateCodeFor(code, selection, {
      code: `
function readCode() {
  \${0:// Implement}
}`,
      position: new Position(1, 0),
      name: 'Create function "readCode"'
    });
  });

  it("assigned to a variable", () => {
    const code = "const code = readCode();";
    const selection = Selection.cursorAt(0, 13);

    shouldUpdateCodeFor(code, selection, {
      code: `
function readCode() {
  \${0:return undefined;}
}`
    });
  });

  it("param of another call", () => {
    const code = "console.log(readCode());";
    const selection = Selection.cursorAt(0, 13);

    shouldUpdateCodeFor(code, selection);
  });

  it("with assigned value referenced later", () => {
    const code = `const code = readCode();
write(code);`;
    const selection = Selection.cursorAt(0, 13);

    shouldUpdateCodeFor(code, selection, {
      code: `
function readCode() {
  \${0:return undefined;}
}

`
    });
  });

  it("doesn't add unnecessary blank lines (1 blank line in-between)", () => {
    const code = `const code = readCode();

write(code);`;
    const selection = Selection.cursorAt(0, 13);

    shouldUpdateCodeFor(code, selection, {
      code: `
function readCode() {
  \${0:return undefined;}
}
`
    });
  });

  it("doesn't add unnecessary blank lines (2+ blank lines in-between)", () => {
    const code = `const code = readCode();



write(code);`;
    const selection = Selection.cursorAt(0, 13);

    shouldUpdateCodeFor(code, selection, {
      code: `
function readCode() {
  \${0:return undefined;}
}`
    });
  });

  it("with other function declarations in the code", () => {
    const code = `readCode();

function write(code) {}`;
    const selection = Selection.cursorAt(0, 0);

    shouldUpdateCodeFor(code, selection);
  });

  it("with params", () => {
    const code = `readCode(selection, "hello", 12);`;
    const selection = Selection.cursorAt(0, 0);

    shouldUpdateCodeFor(code, selection, {
      code: `
function readCode(\${1:selection}, \${2:param2}, \${3:param3}) {
  \${0:// Implement}
}`,
      name: 'Create function "readCode"'
    });
  });

  it("nested in expression statements", () => {
    const code = `it("should read code", () => {
  const code = readCode();

  expect(code).toBe("hello");
});
`;
    const selection = Selection.cursorAt(1, 15);

    shouldUpdateCodeFor(code, selection, {
      code: `
function readCode() {
  \${0:return undefined;}
}`,
      position: new Position(5, 0)
    });
  });
});

it("should not update code if call expression is already declared", () => {
  const code = `readCode();

function readCode() {}`;
  const selection = Selection.cursorAt(0, 0);

  shouldNotUpdateCodeFor(code, selection);
});

it("should not update code if selection is not on call expression", () => {
  const code = `const hello = "world";
readCode();`;
  const selection = Selection.cursorAt(0, 0);

  shouldNotUpdateCodeFor(code, selection);
});

it("should not update code if declared in a const", () => {
  const code = `const readCode = () => "hello";
readCode();`;
  const selection = Selection.cursorAt(1, 0);

  shouldNotUpdateCodeFor(code, selection);
});
