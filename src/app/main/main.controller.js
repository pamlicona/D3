'use strict';

angular
  .module('myNewProject')
  .controller('MainController', MainController)
  .directive('barChart', barChart);

function barChart($window) {
  // Definition directive
  var directive = {
    restrict: 'AE',
    link: linkFunc,
    controller: MainController,
    scope: {
      year: '=year',
      order: "=order",
      state: "=state",
      cb: '&'
    }
  };

  return directive;

  function linkFunc(scope) {
    d3.select(window)
      .on("resize", sizeChange);

    function sizeChange() {
      showMap();
    }

    // Set the dimensions and margins of the graph
    var margin = {top: 80, right: 20, bottom: 30, left: 100},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Functions for watch change in select
    scope.$watch('year', function(value){
      showMap();
    });

    scope.$watch('order', function(value){
      showMap();
    });

    scope.$watch('state', function(value){
      showMap();
    });

    function showMap() {
      scope.width = $window.screen.width;

      // Set the ranges
      if (scope.width > 480) {
        var x = d3.scaleBand()
          .range([0, width])
          .padding(0.1),
          y = d3.scaleLinear()
            .range([height, 0]),
          domainX = x,
          domainY = y,
          titleY = "IDH",
          titleX = "Estados";
      } else {
        var x = d3.scaleLinear()
          .range([0, width]),
          y = d3.scaleBand()
            .range([height, 0])
            .padding(0.1),
          domainX = y,
          domainY = x,
          titleX = "IDH",
          titleY = "Estados";
      }

      // Add the x
      svg.selectAll("g")
        .remove()
        .exit();

      svg.selectAll("text")
        .remove()
        .exit();

      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30 + height)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(titleX);

      // Add the y
      svg.append("g")
        .call(d3.axisLeft(y));

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", -50)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(titleY);

      d3.csv("../../data.csv", function(error, allData) { //Get data of csv
        var dataforYear = [];

        // Filter data for year
        for(var i = 0; i < allData.length; i++){
          if(allData[i]["year"] === scope.year.value){
            dataforYear.push(allData[i]);
          }
        }

        // Format data
        dataforYear.forEach(function(d) {
          d.idh = +d.idh;
        });

        // Create domains X and order data
        if (scope.order.value === 'descending') {
          domainX.domain(dataforYear.sort(
            function (a, b) {
              return b.idh - a.idh;
            }
          ).map(function (d) {
            return d.state;
          }));
        } else if (scope.order.value === 'ascending') {
          domainX.domain(dataforYear.sort(
            function (a, b) {
              return d3.ascending(a.idh, b.idh);
            }
          ).map(function (d) {
            return d.state;
          }));
        } else {
          domainX.domain(dataforYear.sort(
            function (a, b) {
              return d3.ascending(a.state, b.state);
            }
          ).map(function (d) {
            return d.state;
          }));
        }

        // Create domain Y
        domainY.domain([0, d3.max(dataforYear, function (d) {
          return d.idh;
        })]);

        // Append the rectangles for the bar chart
        svg.selectAll(".bar")
          .remove()
          .exit()
          .data(dataforYear)
          .enter().append("rect")
          .style("fill", function (d) { //Style for state selection
            if (d.state === scope.state.value) {
              return "rgb(251,180,174)"
            } else {
              return "rgb(179,205,227)";
            }
          })
          .attr("class", "bar")
          .attr("x", function (d) {
            if (screen.width <= 480) {
              return 0;
            } else {
              return x(d.state);
            }
          })
          .attr("y", function (d) {
            if (screen.width <= 480) {
              return y(d.state);
            } else {
              return y(d.idh);
            }
          })
          .attr("height", function (d) {
            if (screen.width <= 480) {
              return y.bandwidth()
            } else {
              return height - y(d.idh);
            }
          })
          .attr("width", function (d) {
            if (screen.width <= 480) {
              return x(d.idh);
            } else {
              return x.bandwidth();
            }
          });
      });
    }
  }
}

MainController.$inject = ['$scope', '$window'];

function MainController($scope, $window) {
  // Values for select 'years'
  $scope.years = [
    {value: "2015", name: "2015"},
    {value: "2016", name: "2016"},
    {value: "2017", name: "2017"},
    {value: "2018", name: "2018"},
    {value: "2019", name: "2019"}
  ];
  $scope.year = $scope.years[0];

  // Values for select 'order'
  $scope.orderBy = [
    {value: "ascending", name: "Ascendente"},
    {value: "descending", name: "Descendente"},
    {value: "alpha", name: "Alfabéticamente"}
  ];
  $scope.order = $scope.orderBy[0];

  // Values for select 'states'
  $scope.states = [
    {value: "Aguascalientes", name: "Aguascalientes"},
    {value: "Baja California", name: "Baja California"},
    {value: "Baja California Sur", name: "Baja California Sur"},
    {value: "Campeche", name: "Campeche"},
    {value: "Chiapas", name: "Chiapas"},
    {value: "Chihuahua", name: "Chihuahua"},
    {value: "Ciudad de México", name: "Ciudad de México"},
    {value: "Coahuila", name: "Coahuila"},
    {value: "Colima", name: "Colima"},
    {value: "Durango", name: "Durango"},
    {value: "Guanajuato", name: "Guanajuato"},
    {value: "Guerrero", name: "Guerrero"},
    {value: "Hidalgo", name: "Hidalgo"},
    {value: "Jalisco", name: "Jalisco"},
    {value: "México", name: "México"},
    {value: "Michoacán", name: "Michoacán"},
    {value: "Morelos", name: "Morelos"},
    {value: "Nayarit", name: "Nayarit"},
    {value: "Nuevo León", name: "Nuevo León"},
    {value: "Oaxaca", name: "Oaxaca"},
    {value: "Puebla", name: "Puebla"},
    {value: "Querétaro", name: "Querétaro"},
    {value: "Quintana Roo", name: "Quintana Roo"},
    {value: "San Luis Potosí", name: "San Luis Potosí"},
    {value: "Sinaloa", name: "Sinaloa"},
    {value: "Sonora", name: "Sonora"},
    {value: "Tabasco", name: "Tabasco"},
    {value: "Tamaulipas", name: "Tamaulipas"},
    {value: "Tlaxcala", name: "Tlaxcala"},
    {value: "Veracruz", name: "Veracruz"},
    {value: "Yucatán", name: "Yucatán"},
    {value: "Zacatecas", name: "Zacatecas"}
  ];
  $scope.state = $scope.states[0];

}
