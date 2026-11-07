PORT ?= 8000

serve:
	@site="$(word 2,$(MAKECMDGOALS))"; \
	if [ -z "$$site" ]; then \
		echo "usage: make serve <site>  (PORT=$(PORT))"; \
		echo "available sites:"; \
		ls -1 sites | sed 's/^/  /'; \
		exit 1; \
	fi; \
	if [ ! -d "sites/$$site" ]; then \
		echo "unknown site: $$site"; \
		ls -1 sites | sed 's/^/  /'; \
		exit 1; \
	fi; \
	echo "serving sites/$$site at http://127.0.0.1:$(PORT)/  (Ctrl-C to stop)"; \
	python3 -m http.server $(PORT) --bind 127.0.0.1 --directory "sites/$$site"

%: ;

.PHONY: serve
