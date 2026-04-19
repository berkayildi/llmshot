.PHONY: setup dev build preview lint clean

setup:
	npm install

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

lint:
	npm run lint

clean:
	rm -rf node_modules dist
