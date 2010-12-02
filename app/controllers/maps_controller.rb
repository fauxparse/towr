class MapsController < ApplicationController
  def index
    
  end

  def new
    @map = Map.new
  end

  def show
    @map = Map.find params[:id].to_map_code
  end

end
