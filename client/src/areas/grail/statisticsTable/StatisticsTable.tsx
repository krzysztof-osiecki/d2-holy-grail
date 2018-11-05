import * as React from "react";
import { Util } from "../../../common/utils/Util";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { createStyles, WithStyles, Theme, withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography/Typography";
import { HolyGrailDataManager } from "../HolyGrailDataManager";

export interface IStatisticsTableProps {
  data: any;
}

export interface IStatisticsTableSTate {
  data: any;
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 700,
      margin: "auto",
      marginTop: theme.spacing.unit * 3,
      overflowX: "auto"
    },
    table: {
      maxWidth: 700
    },
    total: {
      ...theme.typography.subheading
    }
  });

type Props = IStatisticsTableProps & WithStyles<typeof styles>;

class Stats {
  public total: number = 0;
  public found: number = 0;

  public constructor(public name: string) {}
}

class StatisticsTable extends React.Component<Props, IStatisticsTableSTate> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      data: props.data
    };
  }

  public static getDerivedStateFromProps(props: Props, state: IStatisticsTableSTate) {
    state.data = props.data;
    return state;
  }

  public render() {
    const stats: Stats[] = [
      this.calculateStats(() => this.state.data.uniques.armor, new Stats("Unique Armors")),
      this.calculateStats(() => this.state.data.uniques.weapons, new Stats("Unique Weapons")),
      this.calculateStats(() => this.state.data.uniques.other, new Stats("Unique Other")),
      HolyGrailDataManager.current.isEthMode ? null : this.calculateStats(() => this.state.data.sets, new Stats("Sets"))
    ].filter(s => !!s);

    const totalStats = new Stats("Total");
    stats.reduce((accumulator, currentValue) => {
      accumulator.found += currentValue.found;
      accumulator.total += currentValue.total;
      return accumulator;
    }, totalStats);

    const classes = this.props.classes;

    return (
      <div>
        <Typography variant="h6" align={"center"}>
          Statistics
        </Typography>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>&nbsp;</TableCell>
                <TableCell numeric={true}>Exist</TableCell>
                <TableCell numeric={true}>Owned</TableCell>
                <TableCell numeric={true}>Remaining</TableCell>
                <TableCell numeric={true}>% Completed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.map(s => StatisticsTable.renderRow(s))}
              {StatisticsTable.renderRow(totalStats, true, classes.total)}
            </TableBody>
          </Table>
        </Paper>
      </div>
    );
  }

  private static renderRow(stats: Stats, isSelected?: boolean, className?: string) {
    return (
      <TableRow key={`${stats.name}Stat`} hover={true} selected={isSelected} className={className}>
        <TableCell component="th" scope="row">
          {stats.name}
        </TableCell>
        <TableCell numeric={true}>{stats.total}</TableCell>
        <TableCell numeric={true}>{stats.found}</TableCell>
        <TableCell numeric={true}>{stats.total - stats.found}</TableCell>
        <TableCell numeric={true}>{(stats.total ? (stats.found * 100) / stats.total : 0).toFixed(2)}</TableCell>
      </TableRow>
    );
  }

  private calculateStats(dataFunc: () => any, stats: Stats): Stats {
    let data = {};
    try {
      data = dataFunc();
    } catch (e) {
      // ignore error
    }

    if (!data) {
      return stats;
    }

    Object.keys(data).forEach(key => {
      const possibleItem = data[key];
      if (Util.isItem(possibleItem)) {
        stats.total++;
        if (possibleItem.wasFound) {
          stats.found++;
        }
      } else {
        this.calculateStats(() => possibleItem, stats);
      }
    });
    return stats;
  }
}

export default withStyles(styles)(StatisticsTable);
