require('module-alias/register');
const BOBasePage = require('@pages/BO/BObasePage');

module.exports = class Contacts extends BOBasePage {
  constructor(page) {
    super(page);

    this.pageTitle = 'Contacts';

    // Selectors
    // Header selectors
    this.addNewContactButton = '#page-header-desc-configuration-add';
    // List of contacts
    this.contactsGridPanel = '#contact_grid_panel';
    this.contactsGridTitle = `${this.contactsGridPanel} h3.card-header-title`;
    this.contactsListForm = '#contact_grid';
    this.contactsListTableRow = `${this.contactsListForm} tbody tr:nth-child(%ROW)`;
    this.contactsListTableColumn = `${this.contactsListTableRow} td.column-%COLUMN`;
    // Filters
    this.contactFilterInput = `${this.contactsListForm} #contact_%FILTERBY`;
    this.filterSearchButton = `${this.contactsListForm} button[name='contact[actions][search]']`;
    this.filterResetButton = `${this.contactsListForm} button[name='contact[actions][reset]']`;
    // Actions buttons in Row
    this.contactsListTableActionsColumn = this.contactsListTableColumn.replace('%COLUMN', 'actions');
    this.listTableToggleDropDown = `${this.contactsListTableActionsColumn} a[data-toggle='dropdown']`;
    this.listTableEditLink = `${this.contactsListTableActionsColumn} a[href*='edit']`;
    this.deleteRowLink = `${this.contactsListTableActionsColumn} a[data-method='POST']`;
    // Bulk Actions
    this.selectAllRowsLabel = `${this.contactsGridPanel} .md-checkbox label`;
    this.bulkActionsToggleButton = `${this.contactsGridPanel} button.js-bulk-actions-btn`;
    this.bulkActionsDeleteButton = '#contact_grid_bulk_action_delete_all';
  }

  /*
  Methods
   */

  /**
   * Reset input filters
   * @return {Promise<integer>}
   */
  async resetFilter() {
    if (!(await this.elementNotVisible(this.filterResetButton, 2000))) {
      await this.clickAndWaitForNavigation(this.filterResetButton);
    }
  }

  /**
   * get number of elements in grid
   * @return {Promise<integer>}
   */
  async getNumberOfElementInGrid() {
    return this.getNumberFromText(this.contactsGridTitle);
  }

  /**
   * Reset Filter And get number of elements in list
   * @return {Promise<integer>}
   */
  async resetAndGetNumberOfLines() {
    await this.resetFilter();
    return this.getNumberOfElementInGrid();
  }

  /**
   * Filter list of contacts
   * @param filterBy, column to filter
   * @param value, value to filter with
   * @return {Promise<void>}
   */
  async filterContacts(filterBy, value = '') {
    await this.setValue(this.contactFilterInput.replace('%FILTERBY', filterBy), value.toString());
    // click on search
    await this.clickAndWaitForNavigation(this.filterSearchButton);
  }

  /**
   * get text from a column
   * @param row, row in table
   * @param column, which column
   * @return {Promise<textContent>}
   */
  async getTextColumnFromTableContacts(row, column) {
    return this.getTextContent(
      this.contactsListTableColumn
        .replace('%ROW', row)
        .replace('%COLUMN', column),
    );
  }

  /**
   * Go to new Contact page
   * @return {Promise<void>}
   */
  async goToAddNewContactPage() {
    await this.clickAndWaitForNavigation(this.addNewContactButton);
  }

  /**
   * Go to Edit Contact page
   * @param row, row in table
   * @return {Promise<void>}
   */
  async goToEditContactPage(row) {
    this.clickAndWaitForNavigation(this.listTableEditLink.replace('%ROW', row));
  }

  /**
   * Delete Contact
   * @param row, row in table
   * @return {Promise<textContent>}
   */
  async deleteContact(row) {
    this.dialogListener();
    // Click on dropDown
    await Promise.all([
      this.page.click(this.listTableToggleDropDown.replace('%ROW', row)),
      this.page.waitForSelector(
        `${this.listTableToggleDropDown.replace('%ROW', row)}[aria-expanded='true']`,
        {visible: true},
      ),
    ]);
    // Click on delete
    await this.clickAndWaitForNavigation(this.deleteRowLink.replace('%ROW', row));
    return this.getTextContent(this.alertSuccessBlockParagraph);
  }

  /**
   * Delete all contacts in table with Bulk Actions
   * @return {Promise<string>}
   */
  async deleteContactsBulkActions() {
    // Add listener to dialog to accept deletion
    this.dialogListener();
    // Click on Select All
    await Promise.all([
      this.page.click(this.selectAllRowsLabel),
      this.page.waitForSelector(`${this.selectAllRowsLabel}:not([disabled])`, {visible: true}),
    ]);
    // Click on Button Bulk actions
    await Promise.all([
      this.page.click(this.bulkActionsToggleButton),
      this.page.waitForSelector(this.bulkActionsToggleButton, {visible: true}),
    ]);
    // Click on delete and wait for modal
    await this.clickAndWaitForNavigation(this.bulkActionsDeleteButton);
    return this.getTextContent(this.alertSuccessBlockParagraph);
  }
};
