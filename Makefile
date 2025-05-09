reset: ## Reset the prometheus data and Grafana dashboards
	# Delete all Grafana dashboards
	@DASHBOARDS=$$(curl -s -u admin:admin 'http://localhost:3001/api/search?query=&type=dash-db' | grep -o '"uid":"[^\"]*"' | cut -d'"' -f4); \
	for DASH_UID in $$DASHBOARDS; do \
	  echo "Deleting dashboard UID: $$DASH_UID"; \
	  curl -s -X DELETE -u admin:admin http://localhost:3001/api/dashboards/uid/$$DASH_UID; \
	done
	# Reset Prometheus data
	docker-compose stop prometheus
	rm -rf ./prometheus/data
	mkdir -p ./prometheus/data
	docker-compose up -d prometheus

token: ## Create a Grafana service account and token
	@echo "Creating Grafana service account..."
	@SA_ID=$$(curl -s -X POST http://localhost:3001/api/serviceaccounts -u admin:admin -H 'Content-Type: application/json' -d '{"name":"demo-mcp-service-account","role":"Admin"}' | grep -o '"id":[0-9]*' | cut -d: -f2); \
	if [ -z "$$SA_ID" ]; then echo "Failed to create service account"; exit 1; fi; \
	echo "Service account ID: $$SA_ID"; \
	echo "Creating token for service account..."; \
	TOKEN=$$(curl -s -X POST http://localhost:3001/api/serviceaccounts/$$SA_ID/tokens -u admin:admin -H 'Content-Type: application/json' -d '{"name":"demo-mcp-token"}' | grep -o '"key":"[^"]*"' | cut -d'"' -f4); \
	if [ -z "$$TOKEN" ]; then echo "Failed to create token"; exit 1; fi; \
	echo "Provisioned token: $$TOKEN"; 

up: ## Start the services
	docker-compose up -d --build

down: ## Stop the services
	docker-compose down

stop: ## Stop the services
	docker-compose stop
