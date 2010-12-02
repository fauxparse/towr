class MapsController < ApplicationController
  def new
    @map = Map.new
  end

  def show
    @map = Map.find params[:id].to_map_code
  end

end
