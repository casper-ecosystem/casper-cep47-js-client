// This is just a mock of persistance of deploys - it can be replaced with db controller or any other solution.
class PendingDeploys {
  public pendingDeploys: string[] = [];

  public add(deployHash: string) {
    this.pendingDeploys = [...this.pendingDeploys, deployHash];
  }

  public remove(deployHash: string) {
    this.pendingDeploys = this.pendingDeploys.filter(
      (pending) => pending !== deployHash
    );
  }

  public find(deployHash: string) {
    return this.pendingDeploys.find(d => d === deployHash);
  }

  public get() {
    return this.pendingDeploys;
  }
}

export default new PendingDeploys();
