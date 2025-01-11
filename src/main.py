from playwright.sync_api import sync_playwright
import json
import time
import pandas as pd
import os
import shutil
from LastUpdated import LastUpdated

def delete_existing_files():
    folder = "../data"
    if os.path.exists(folder):
        shutil.rmtree(folder)
        os.makedirs(folder)

def create_folders():
    folders = ["../data/csv/regional_data", "../data/json/regional_data"]
    for folder in folders:
        if not os.path.exists(folder):
            os.makedirs(folder)

def get_num_of_tables(page):
        page.wait_for_selector("ul.pagination.pagination-md.links")
        list_items = page.locator("ul.pagination.pagination-md.links li").element_handles()
        num_of_tables = list_items[-2].inner_text()
        return num_of_tables

def scrape_table():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)  # Set headless=False to see the browser
        page = browser.new_page()
        all_regions = {}

        LastUpdated(page)

        delete_existing_files()
        create_folders()
        #"kauno", "vilniaus", "klaipedos", "siauliu", 
        regions = ["panevezio", "alytaus"]
        for region in regions:
            regional_data = []
            region_link = f"https://sauktiniai.karys.lt/#/list/{region}"
            page.goto(region_link)
            print(f"Scraping {region} region", region_link)
            time.sleep(1)

            num_of_tables = get_num_of_tables(page)
            page.wait_for_selector("a[data-ng-click='gotoPage(page+1)']")
            next_page_link = page.locator("a[data-ng-click='gotoPage(page+1)']")

            for id in range (1, int(num_of_tables)+1):
                print(f"Handling table: {id}")
                time.sleep(0.1)

                page.wait_for_selector("results-table")
                rows = page.locator("results-table tbody tr")
                data = []
                for row in rows.element_handles():
                    cells = row.query_selector_all("td")
                    data.append({
                    "eil_nr": cells[0].inner_text(),
                    "vardas": cells[1].inner_text().split(" ")[0],
                    "pavarde": cells[1].inner_text().split(" ")[1],
                    "gimimo_metai": cells[2].inner_text(),
                    "karo_prievalininko_kodas": cells[3].inner_text(),
                    "nurodymai": cells[4].inner_text(),
                    })
                
                regional_data.extend(data)
                next_page_link.click()


            df = pd.DataFrame(regional_data)
            csv_fileloc = f"../data/csv/regional_data/{region}.csv"
            df.to_csv(csv_fileloc, index=False)
            table_json = json.dumps(regional_data, ensure_ascii=False, indent=4)
            with open(f"../data/json/regional_data/{region}.json", "a", encoding="utf-8") as f:
                f.write(table_json)
            all_regions[region] = regional_data
        
        all_regions_csv = []
        for region in all_regions:
            for data in all_regions[region]:
                data["region"] = region
                all_regions_csv.append(data)

        all_regions = json.dumps(all_regions, ensure_ascii=False, indent=4)
        with open("../data/json/all_regions.json", "a", encoding="utf-8") as f:
            f.write(all_regions)

        df = pd.DataFrame(all_regions_csv)
        csv_fileloc = "../data/csv/all_regions.csv"
        df.to_csv(csv_fileloc, index=False)
        

        browser.close()

if __name__ == "__main__":
    scrape_table()
