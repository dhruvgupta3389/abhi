#!/bin/bash

# Delete CSV files from public/data
rm -f public/data/anganwadi_centers.csv
rm -f public/data/bed_requests.csv
rm -f public/data/beds.csv
rm -f public/data/hospitals.csv
rm -f public/data/medical_records.csv
rm -f public/data/notifications.csv
rm -f public/data/patients.csv
rm -f public/data/users.csv
rm -f public/data/visits.csv
rm -f public/data/workers.csv

# Delete CSV files from server/data
rm -f server/data/anganwadi_centers.csv
rm -f server/data/bed_requests.csv
rm -f server/data/beds.csv
rm -f server/data/hospitals.csv
rm -f server/data/medical_records.csv
rm -f server/data/notifications.csv
rm -f server/data/patients.csv
rm -f server/data/users.csv
rm -f server/data/visits.csv
rm -f server/data/workers.csv

echo "✅ All CSV files deleted"
