class Currency {
  constructor(id, name, ticker) {
    this.id = id;
    this.name = name;
    this.ticker = ticker;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  update(name, ticker) {
    this.name = name;
    this.ticker = ticker;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      ticker: this.ticker,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Currency;
